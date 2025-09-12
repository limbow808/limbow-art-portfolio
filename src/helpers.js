
module.exports = {
    addToCart: addToCart,
    removeFromCart: removeFromCart
};

/**
 * Adds a product to the cart while ensuring the requested amount
 * does not exceed the available stock
 * @param {Object} data data object containing product and cart information
 * @param {Object} cart cart object where products are stored, indexed by user ID
 * @returns {Object} cart the modified cart. THe cart is a structure like Object<List<Object>>
 * {"userID": [{product1}, {product2}, ...], ...}
 */
function addToCart(data, cart) {
    // find the product object in the list which holds all products
    let product = data.products.filter(item => item.id === data.productID);

    if (!product) {
        throw new Error("There was a problem locating the product.");
    }
    let availableAmount = 0;

    for (const row of product) {
        availableAmount += parseInt(row.antal);
    }
    //let availableAmount = parseInt(product.antal);

    let selectedAmount = parseInt(data.selectedAmount);

    // check if cart is empty
    if (data.cart[data.id].length !== 0) {
        // cart is not empty
        let productInCart = cart.find(item => item.productID === data.productID);

        // if the is in the cart, the currentAmount is taken from there otherwise 0
        let currentAmount = productInCart ? parseInt(productInCart.alreadyInCart) : 0;

        availableAmount -= currentAmount;

        if (selectedAmount > availableAmount) {
            let errMsg = "Could not add requested amount to cart.\n";

            errMsg +=  `Selected amount: ${selectedAmount}\n`;
            errMsg +=  `Available Amount: ${availableAmount}`;
            throw new Error(errMsg);
        }

        if (productInCart) {
            productInCart.alreadyInCart += selectedAmount;
        } else {
            cart.push(
                createCartEntry(
                    data.productID,
                    data.productName,
                    data.productPrice,
                    selectedAmount)
            );
        }
        return cart;
    } else {
        // empty cart, simply try to add the amount
        if (selectedAmount > availableAmount) {
            let errMsg = "Could not add requested amount to cart.\n";

            errMsg +=  `Selected amount: ${selectedAmount}\n`;
            errMsg +=  `Available Amount: ${availableAmount}`;
            throw new Error(errMsg);
        }
        return [
            createCartEntry(
                data.productID,
                data.productName,
                data.productPrice,
                selectedAmount
            )
        ];
    }
}

function createCartEntry(productID, productName, productPrice, alreadyInCart) {
    return {
        productID: productID,
        productName: productName,
        productPrice: productPrice,
        alreadyInCart: alreadyInCart
    };
}


/**
 * Removes a product from the cart.
 * @param {Object} data data object containing product and cart information
 * @param {Object} cart cart object where products are stored, indexed by user ID
 * @returns {Object} cart the modified cart. THe cart is a structure like Object<List<Object>>
 * {"userID": [{product1}, {product2}, ...], ...}
 */
function removeFromCart(data, cart) {
    // find the product object in the list which holds all products
    let product = data.products.find(item => item.id === data.productID);

    if (!product) {
        throw new Error("There was a problem locating the product.");
    }

    // check if cart is empty
    if (data.cart[data.id].length !== 0) {
        // cart is not empty
        let productInCart = cart.find(item => item.productID === data.productID);

        // if the is in the cart, the currentAmount is taken from there otherwise 0
        let currentAmount = parseInt(productInCart.alreadyInCart);

        currentAmount -= 1;
        console.log(currentAmount);
        if (currentAmount == 0) {
            const index = cart.findIndex(item => item.productID === data.productID);

            cart.splice(index, 1);
        } else {
            productInCart.alreadyInCart = currentAmount;
        }
        return cart;
    }
    throw new Error("Cannot remove product from empty cart!");
}

