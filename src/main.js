function calculateSimpleRevenue(purchase, _product) {
    const discount = 1 - (purchase.discount / 100);
    return purchase.sale_price * purchase.quantity * discount;
   
}

function calculateBonusByProfit(index, total, seller) {
    if (index === 0) {
    return seller.profit * 0.15;
} else if (index === 1 || index === 2) {
    return seller.profit * 0.1;
} else if (index === total - 1) {
    return 0;
} else { 
    return seller.profit * 0.05;
} 
   
}

function analyzeSalesData(data, options) {  
if (!data
    || !Array.isArray(data.sellers)
    || !Array.isArray(data.products)
    || !Array.isArray(data.purchase_records)
    || data.sellers.length === 0
    || data.products.length === 0
    || data.purchase_records.length === 0
    || !(typeof options === "object")
) {
    throw new Error('Некорректные входные данные');
} 
    const { calculateRevenue, calculateBonus } = options;

if (!calculateRevenue || !calculateBonus) {
    throw new Error('Чего-то не хватает');
} 

if (!(typeof calculateRevenue === "function")) {
    throw new Error('Некорректные входные данные');
}

const sellerStats = data.sellers.map(seller => ({
    id: seller.id,
    name: `${seller.first_name} ${seller.last_name}`,
    revenue: 0,
    profit: 0,
    sales_count: 0,
    products_sold: {}
}));  

const sellerIndex = Object.fromEntries(sellerStats.map(item => [item.id, item])); 
const productIndex = Object.fromEntries(data.products.map(item => [item.sku, item])); 

data.purchase_records.forEach(record => { 
    const seller = sellerIndex[record.seller_id]; 
    seller.sales_count++
    seller.revenue += record.total_amount

    record.items.forEach(item => {
        const product = productIndex[item.sku]; 
        const cost = product.purchase_price * item.quantity;
        const revenue = calculateSimpleRevenue(item);
        const profit = revenue - cost;
        seller.profit += profit;

        if (!seller.products_sold[item.sku]) {
            seller.products_sold[item.sku] = 0;
        }
        seller.products_sold[item.sku] += item.quantity;
        });

    sellerStats.sort((a,b) => {
        if (a.profit > b.profit) {
        return -1;
        }

         if (a.profit < b.profit) {
        return 1;
        }
        return 0;
    })
}); 

sellerStats.forEach((seller, index, array) => {
    seller.bonus = calculateBonusByProfit(index, array.length, seller) 

    const sellerArr =  Object.entries(seller.products_sold)
    const arr = sellerArr.map( (item) => {
        const obj = {};
        obj.sku = item[0];
        obj.quantity = item[1];
        return obj;
        })
    arr.sort((a,b) => {
        if (a.quantity > b.quantity) {
            return -1;
        }

        if (a.quantity < b.quantity) {
            return 1;
        }

        return 0;
    })
    seller.top_products = arr.slice(0, 10);
}); 

return sellerStats.map(seller => ({
    seller_id: seller.id,
    name: seller.name,
    revenue: +seller.revenue.toFixed(2),
    profit: +seller.profit.toFixed(2),
    sales_count: seller.sales_count,
    top_products: seller.top_products,
    bonus: +seller.bonus.toFixed(2)
})); 

}

