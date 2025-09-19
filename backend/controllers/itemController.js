import Item from '../modals/item.js'

export const createItem = async (req, res, next) => {
  try {
    const { name, description, category, price, rating, hearts } = req.body
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : ''

    // e.g. total might be price * hearts, or some other logic
    const total = Number(price) * 1 // replace with your own formula

    const newItem = new Item({
      name,
      description,
      category,
      price,
      rating,
      hearts,
      imageUrl,
      total
    })

    const saved = await newItem.save()
    res.status(201).json(saved)
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: 'Item name already exists' })
    } else next(err)
  }
}

export const getItems = async (_req, res, next) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 })
    // Prefix image URLs with host for absolute path
    const host = `${_req.protocol}://${_req.get('host')}`
    const withFullUrl = items.map(i => ({
      ...i.toObject(),
      imageUrl: i.imageUrl ? host + i.imageUrl : ''
    }))
    res.json(withFullUrl)
  } catch (err) {
    next(err)
  }
}

export const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, description, category, price, rating, hearts } = req.body

    // Find the existing item
    const existingItem = await Item.findById(id)
    if (!existingItem) {
      return res.status(404).json({ message: 'Item not found' })
    }

    // Prepare update data
    const updateData = {
      name: name || existingItem.name,
      description: description || existingItem.description,
      category: category || existingItem.category,
      price: price || existingItem.price,
      rating: rating || existingItem.rating,
      hearts: hearts || existingItem.hearts
    }

    // Update image if new one is provided
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`
    }

    // Calculate total
    updateData.total = Number(updateData.price) * 1

    const updatedItem = await Item.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    })

    // Return with full URL
    const host = `${req.protocol}://${req.get('host')}`
    const responseItem = {
      ...updatedItem.toObject(),
      imageUrl: updatedItem.imageUrl ? host + updatedItem.imageUrl : ''
    }

    res.json({ success: true, item: responseItem })
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: 'Item name already exists' })
    } else {
      next(err)
    }
  }
}

export const deleteItem = async (req, res, next) => {
  try {
    const removed = await Item.findByIdAndDelete(req.params.id)
    if (!removed) return res.status(404).json({ message: 'Item not found' })
    res.status(204).end()
  } catch (err) {
    next(err)
  }
}
