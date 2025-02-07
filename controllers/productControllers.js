import ProductModel from "../models/productModel.js";

// Create a new product
const createProductController = async (req, res) => {
  try {
    const product = new ProductModel(req.body);
    const savedProduct = await product.save();
    res.status(200).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all products
const getAllProductsController = async (req, res) => {
  try {
    const products = await ProductModel.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductsByPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const products = await ProductModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalProducts = await ProductModel.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({ products, totalPages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single product by ID
// const getProductByIdController = async (req, res) => {
//   try {
//     const product = await ProductModel.findById(req.params.id);
//     if (!product) return res.status(404).json({ message: "Product not found" });
//     res.status(200).json(product);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const getProductByIdController = async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Calculate total stars, average rating, and total reviews
    const totalStars = product.reviews.reduce(
      (sum, review) => sum + (review.rating || 0),
      0
    );
    const totalReviews = product.reviews.length;
    const averageRating = totalReviews > 0 ? totalStars / totalReviews : 0;

    res.status(200).json({
      product,
      averageRating: averageRating.toFixed(1), // Round to 2 decimal places
      totalReviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getCollections = async (req, res) => {
  try {
    const products = await ProductModel.aggregate([{ $sample: { size: 12 } }]);

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch random products.",
      error: error.message,
    });
  }
};

const searchProductsWithSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchRegex = new RegExp(query, "i");

    // Query the database for matching products
    const products = await ProductModel.find({
      $or: [
        { name: searchRegex },
        { category: searchRegex },
        { subcategory: searchRegex },
        { type: searchRegex },
      ],
    }).limit(12);

    const suggestions = [
      ...new Set(products.map((product) => product.name)),
    ].slice(0, 7);

    res.status(200).json({ products, suggestions });
  } catch (error) {
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const getProductsSearchResults = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Split the query into words and filter out empty values
    const words = query.trim().split(/\s+/).filter(Boolean);
    const regexConditions = words.map((word) => ({
      name: { $regex: new RegExp(word, "i") },
    }));

    // Perform the search
    let products = await ProductModel.aggregate([
      {
        $match: {
          $or: regexConditions, // Match products that contain at least one of the words
        },
      },
      {
        $addFields: {
          matchCount: {
            $size: {
              $filter: {
                input: words,
                as: "word",
                cond: {
                  $regexMatch: {
                    input: "$name",
                    regex: { $concat: [".*", "$$word", ".*"] },
                  },
                },
              },
            },
          },
          startsWithMatch: {
            $cond: [
              {
                $regexMatch: {
                  input: "$name",
                  regex: new RegExp(`^${query}`, "i"),
                },
              },
              1,
              0,
            ],
          },
          exactMatch: {
            $cond: [{ $eq: ["$name", query] }, 1, 0],
          },
        },
      },
      {
        $sort: {
          exactMatch: -1, // Prioritize exact matches first
          startsWithMatch: -1, // Then names that start with the search query
          matchCount: -1, // Then names with more matched words
          name: 1, // Lastly, sort alphabetically
        },
      },
    ]);

    if (!products.length) {
      return res
        .status(404)
        .json({ message: "No products found with a similar name." });
    }

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error. Please refresh the page." });
  }
};

// Update a product by ID
const updateProductController = async (req, res) => {
  try {
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct)
      return res.status(404).json({ message: "Product not found" });
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a product by ID
const deleteProductController = async (req, res) => {
  try {
    const deletedProduct = await ProductModel.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a review to a product
const addReviewController = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.reviews.push(req.body);
    const updatedProduct = await product.save();

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a review by product ID and review ID
// export const updateReview = async (req, res) => {
//   try {
//     const { id, reviewId } = req.params;
//     const product = await ProductModel.findById(id);
//     if (!product) return res.status(404).json({ message: "Product not found" });

//     const review = product.reviews.id(reviewId);
//     if (!review) return res.status(404).json({ message: "Review not found" });

//     review.set(req.body);
//     const updatedProduct = await product.save();
//     res.status(200).json(updatedProduct);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Delete a review by product ID and review ID
// export const deleteReview = async (req, res) => {
//   try {
//     const { id, reviewId } = req.params;
//     const product = await ProductModel.findById(id);
//     if (!product) return res.status(404).json({ message: "Product not found" });

//     const review = product.reviews.id(reviewId);
//     if (!review) return res.status(404).json({ message: "Review not found" });

//     review.remove();
//     const updatedProduct = await product.save();
//     res.status(200).json(updatedProduct);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const getBestSellerProducts = async (req, res) => {
  try {
    const products = await ProductModel.find({ bestSeller: true }).sort({
      createdAt: -1,
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNewArrivalProducts = async (req, res) => {
  try {
    const products = await ProductModel.find({ newArrival: true }).sort({
      createdAt: -1,
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getActiveWearProducts = async (req, res) => {
  try {
    const products = await ProductModel.find({ category: "Active Wear" }).sort({
      createdAt: -1,
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFitnessAccessoriesProducts = async (req, res) => {
  try {
    const products = await ProductModel.find({
      category: "Fitness Accessories",
    }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProductToBestSeller = async (req, res) => {
  let { status } = req.body;

  // Convert the 'status' string to a boolean
  if (status === "isBestSeller") {
    status = true;
  } else if (status === "notBestSeller") {
    status = false;
  } else {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update the order delivery status
    product.bestSeller = status;
    await product.save();

    // Respond with an appropriate message
    const message = status
      ? "Product updated to best seller"
      : "Product updated to non best seller";
    res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProductToNewArrival = async (req, res) => {
  let { status } = req.body;

  // Convert the 'status' string to a boolean
  if (status === "isNewArrival") {
    status = true;
  } else if (status === "notNewArrival") {
    status = false;
  } else {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update the order delivery status
    product.newArrival = status;
    await product.save();

    // Respond with an appropriate message
    const message = status
      ? "Product updated to new arrival"
      : "Product updated to not new arrival";
    res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createProductController,
  getAllProductsController,
  getProductsByPage,
  getProductByIdController,
  getCollections,
  searchProductsWithSuggestions,
  getProductsSearchResults,
  updateProductController,
  deleteProductController,
  addReviewController,
  getBestSellerProducts,
  getNewArrivalProducts,
  getActiveWearProducts,
  getFitnessAccessoriesProducts,
  updateProductToBestSeller,
  updateProductToNewArrival,
};
