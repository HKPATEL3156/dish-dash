// controllers/foodController.js
import Stripe from 'stripe'
import Order from '../modals/order.js'
import Item from '../modals/item.js'
import 'dotenv/config'

// Initialize Stripe with validation
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not defined in environment variables')
  process.exit(1)
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Helper function to validate URLs
const isValidUrl = string => {
  try {
    const url = new URL(string)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch (_) {
    return false
  }
}

// Helper function to construct absolute image URL
const getAbsoluteImageUrl = imageUrl => {
  if (!imageUrl) return null

  // If it's already a full URL, use it
  if (imageUrl.startsWith('http')) {
    return isValidUrl(imageUrl) ? imageUrl : null
  }

  // If it's a relative path starting with '/', construct full URL
  if (imageUrl.startsWith('/')) {
    const fullUrl = `${process.env.FRONTEND_URL}${imageUrl}`
    return isValidUrl(fullUrl) ? fullUrl : null
  }

  // Sanitize image URL by replacing spaces with underscores
  const sanitizedImageUrl = imageUrl.replace(/\s+/g, '_')

  // If it's just a filename, construct the full URL assuming it's in uploads
  const fullUrl = `${process.env.FRONTEND_URL}/uploads/${sanitizedImageUrl}`
  return isValidUrl(fullUrl) ? fullUrl : null
}

// Create Order
export const createOrder = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      email,
      address,
      city,
      zipCode,
      paymentMethod,
      subtotal,
      tax,
      total,
      items
    } = req.body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid or empty items array' })
    }

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'Invalid email address' })
    }

    // Normalize incoming item structure
    const orderItems = items.map(
      ({ item, name, price, imageUrl, quantity }) => {
        const base = item || {}
        return {
          item: {
            name: base.name || name || 'Unknown',
            price: Number(base.price ?? price) || 0,
            imageUrl: base.imageUrl || imageUrl || ''
          },
          quantity: Number(quantity) || 0
        }
      }
    )

    // Default shipping cost
    const shippingCost = 0
    let newOrder

    // Validate environment variables before creating Stripe session
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not defined in environment variables')
      return res
        .status(500)
        .json({ message: 'Server configuration error: Missing Stripe key' })
    }

    if (!process.env.FRONTEND_URL) {
      console.error('FRONTEND_URL is not defined in environment variables')
      return res
        .status(500)
        .json({ message: 'Server configuration error: Missing frontend URL' })
    }

    // Validate order items have valid prices
    const invalidItems = orderItems.filter(item => item.item.price <= 0)
    if (invalidItems.length > 0) {
      return res.status(400).json({ message: 'Invalid item prices detected' })
    }

    if (paymentMethod === 'online') {
      try {
        console.log('Creating Stripe session...')

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'payment',
          line_items: orderItems.map(o => {
            // Debug log to see what image URLs we're getting
            console.log('Original imageUrl:', o.item.imageUrl)

            const absoluteImageUrl = getAbsoluteImageUrl(o.item.imageUrl)
            console.log('Processed imageUrl:', absoluteImageUrl)

            return {
              price_data: {
                currency: 'inr',
                product_data: {
                  name: o.item.name,
                  // Only include images if they're valid URLs, otherwise omit the field
                  ...(absoluteImageUrl ? { images: [absoluteImageUrl] } : {})
                },
                unit_amount: Math.round(o.item.price * 100)
              },
              quantity: o.quantity
            }
          }),
          customer_email: email,
          success_url: `${process.env.FRONTEND_URL}/myorder/verify?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.FRONTEND_URL}/checkout?payment_status=cancel`,
          metadata: {
            firstName,
            lastName,
            email,
            phone,
            address,
            city,
            zipCode
          }
        })

        console.log('Stripe session created successfully:', session.id)

        newOrder = new Order({
          user: req.user._id,
          firstName,
          lastName,
          phone,
          email,
          address,
          city,
          zipCode,
          paymentMethod,
          subtotal,
          tax,
          total,
          shipping: shippingCost,
          items: orderItems,
          paymentIntentId: session.payment_intent,
          sessionId: session.id,
          paymentStatus: 'pending'
        })

        await newOrder.save()
        return res.status(201).json({
          success: true,
          order: newOrder,
          checkoutUrl: session.url
        })
      } catch (stripeError) {
        console.error('Stripe session creation error:', stripeError)
        console.error('Error details:', stripeError.message)
        return res.status(500).json({
          message: 'Stripe payment error',
          error: stripeError.message,
          details: stripeError.type || 'Unknown error type'
        })
      }
    }

    // COD Handling
    newOrder = new Order({
      user: req.user._id,
      firstName,
      lastName,
      phone,
      email,
      address,
      city,
      zipCode,
      paymentMethod,
      subtotal,
      tax,
      total,
      shipping: shippingCost,
      items: orderItems,
      paymentStatus: 'succeeded'
    })

    await newOrder.save()
    res.status(201).json({ success: true, order: newOrder, checkoutUrl: null })
  } catch (error) {
    console.error('createOrder error:', error)
    res.status(500).json({ message: 'Server Error', error: error.message })
  }
}

// Confirm Payment
export const confirmPayment = async (req, res) => {
  try {
    const { session_id } = req.query
    if (!session_id) {
      return res.status(400).json({ message: 'session_id required' })
    }

    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not defined in environment variables')
      return res
        .status(500)
        .json({ message: 'Server configuration error: Missing Stripe key' })
    }

    const session = await stripe.checkout.sessions.retrieve(session_id)

    if (session.payment_status === 'paid') {
      const order = await Order.findOneAndUpdate(
        { sessionId: session_id },
        { paymentStatus: 'succeeded' },
        { new: true }
      )

      if (!order) {
        return res.status(404).json({ message: 'Order not found' })
      }

      return res.json({
        success: true,
        order,
        message: 'Payment confirmed successfully'
      })
    } else {
      return res.status(400).json({
        message: 'Payment not completed',
        paymentStatus: session.payment_status
      })
    }
  } catch (err) {
    console.error('confirmPayment error:', err)
    res.status(500).json({
      message: 'Server Error',
      error: err.message,
      details: err.type || 'Unknown error type'
    })
  }
}

// Get Orders
export const getOrders = async (req, res) => {
  try {
    // only return orders belonging to this user
    const filter = { user: req.user._id }
    const rawOrders = await Order.find(filter).sort({ createdAt: -1 }).lean()

    // Format for front-end
    const formatted = rawOrders.map(o => ({
      ...o,
      items: o.items.map(i => ({
        _id: i._id,
        item: i.item,
        quantity: i.quantity
      })),
      createdAt: o.createdAt,
      paymentStatus: o.paymentStatus
    }))

    res.json(formatted)
  } catch (error) {
    console.error('getOrders error:', error)
    res.status(500).json({ message: 'Server Error', error: error.message })
  }
}

export const getAllOrders = async (req, res) => {
  try {
    const raw = await Order.find({}).sort({ createdAt: -1 }).lean()

    const formatted = raw.map(o => ({
      _id: o._id,
      user: o.user,
      firstName: o.firstName,
      lastName: o.lastName,
      email: o.email,
      phone: o.phone,
      address: o.address ?? o.shippingAddress?.address ?? '',
      city: o.city ?? o.shippingAddress?.city ?? '',
      zipCode: o.zipCode ?? o.shippingAddress?.zipCode ?? '',
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      status: o.status,
      createdAt: o.createdAt,
      items: o.items.map(i => ({
        _id: i._id,
        item: i.item,
        quantity: i.quantity
      }))
    }))

    res.json(formatted)
  } catch (error) {
    console.error('getAllOrders error:', error)
    res.status(500).json({ message: 'Server Error', error: error.message })
  }
}

// NEW: updateAnyOrder — no ownership check
export const updateAnyOrder = async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    if (!updated) {
      return res.status(404).json({ message: 'Order not found' })
    }
    res.json(updated)
  } catch (error) {
    console.error('updateAnyOrder error:', error)
    res.status(500).json({ message: 'Server Error', error: error.message })
  }
}

// Get Order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })

    if (!order.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' })
    }

    if (req.query.email && order.email !== req.query.email) {
      return res.status(403).json({ message: 'Access denied' })
    }
    res.json(order)
  } catch (error) {
    console.error('getOrderById error:', error)
    res.status(500).json({ message: 'Server Error', error: error.message })
  }
}

// Update Order
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })

    if (!order.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' })
    }

    if (req.body.email && order.email !== req.body.email) {
      return res.status(403).json({ message: 'Access denied' })
    }
    const updated = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    })
    res.json(updated)
  } catch (error) {
    console.error('updateOrder error:', error)
    res.status(500).json({ message: 'Server Error', error: error.message })
  }
}

// Search Foods
export const searchFoods = async (req, res) => {
  try {
    const { query } = req.query
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' })
    }
    const foods = await Item.find({ name: { $regex: query, $options: 'i' } }) // Case-insensitive search
    res.json(foods)
  } catch (error) {
    console.error('searchFoods error:', error)
    res.status(500).json({ message: 'Server Error', error: error.message })
  }
}
