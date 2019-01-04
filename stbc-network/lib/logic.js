'use strict';
/**
 * Company owner issueing company's share on behalf of company
 * @param {org.yky.stbc.ShareIssue} shareIssue
 * @transaction
 */

function onShareIssue(shareIssue) {
    var trader = getCurrentParticipant()
    return getParticipantRegistry('org.yky.stbc.Company')
        .then(function (companyRegistry) {
            return companyRegistry.get(shareIssue.company.getIdentifier())
                .then(function (issueingCompany) {
                    return addShare(trader, issueingCompany, shareIssue.count)
                        .then(function () {
                            issueingCompany.issuedShareCount += shareIssue.count;
                            return companyRegistry.update(issueingCompany);
                        })
                });
        })
}


/**
 * Transaction Order for buy or sell
 * @param {org.yky.stbc.PlaceOrder} OrderRequest
 * @transaction
 */
function onOrder(OrderRequest) {
    if (OrderRequest.count <= 0 || OrderRequest.company == null) {
        //todo : company has to be checked for its existance
        return;//todo : handle error
    }
    var trader = getCurrentParticipant();
    if (OrderRequest.OrderType == 'FOR_SALE') {
        return processSaleOrder(OrderRequest, trader);
    }
    if (OrderRequest.OrderType == 'FOR_BUY') {
        return processBuyOrder(OrderRequest, trader);
    }
}

function processBuyOrder(OrderRequest, buyer) {
    var totalAmount = OrderRequest.count * OrderRequest.price;
    if (buyer.balance < totalAmount) {
        console.log('trader does not have enough balance');
        return; //error has to be thrown
    }
    return query('selectSaleOrderOfCompany', {
        "company": OrderRequest.company.toURI(),
        "price": OrderRequest.price//limit has to be provided
    })
        .then(function (saleOrders) {
            return processOrder(OrderRequest, saleOrders, buyer, "FOR_BUY")
        })
}

function processSaleOrder(OrderRequest, seller) {
    return query('selectShareByUserAndCompany', {
        "owner": seller.toURI(),
        "company": OrderRequest.company.toURI()
    }).
        then(function (shareRecodrds) {
            if (shareRecodrds.length == 0 || shareRecodrds[0].count < OrderRequest.count) {
                return; //error has to be returned if the trader does not have enough shares as per the claim;            
            }
            return query('selectBuyOrderOfCompany', { //Fix : has to be in ascending order of price
                company: OrderRequest.company.toURI(),
                price: OrderRequest.price
            })
                .then(function (buyOrders) {
                    return processOrder(OrderRequest, buyOrders, seller, "FOR_SALE")
                })
        })
}

function processOrder(Order, counterOrders, trader, type) {
    var settlementMap = {}, reaminingToProcess = Order.count, promises = [];
    for (var i = 0; i < counterOrders.length && reaminingToProcess > 0; i++) {
        var availableForTrasnfer = (reaminingToProcess <= counterOrders[i].count) ? reaminingToProcess : counterOrders[i].count;
        reaminingToProcess -= availableForTrasnfer;
        settlementMap[counterOrders[i].OrderId] = availableForTrasnfer;
    }
    counterOrders.forEach(function (counterOrder) {
        if (settlementMap[counterOrder.OrderId]) {
            promises.push(
                settleCounterOrder(Order, trader, counterOrder, type, settlementMap[counterOrder.OrderId], counterOrder.price)
            );
        }
    })
    return Promise.all(promises)
        .then(function () {
            return addNewOrder(trader, Order.company, reaminingToProcess, type, Order.price);
        })
}

function tradersFromOrders(Orders) {
    var traders = [], promises = [];
    getParticipantRegistry('org.yky.stbc.Trader')
        .then(function (traderRegistry) {
            Orders.forEach(function (Order) {
                promises.push(function () {
                    traderRegistry.get(Order.trader.getIdentifier())
                        .then(function (trader) {
                            traders.push(trader);
                        })
                })
            })
        })
    return Promise.all(promises)
        .then(function () {
            return traders;
        })
}

function settleCounterOrder(Order, firstParty, counterOrder, OrderType, count, stockPrice) {
    if (Order.company.getIdentifier() != counterOrder.company.getIdentifier()) {
        return //throw error; Cannot settle Orders
    }
    if (firstParty.getIdentifier() == counterOrder.trader.getIdentifier()) {
        return //throw error : buy and sell among same trader
    }
    var buyer = (OrderType == "FOR_SALE") ? counterOrder.trader : firstParty;
    var seller = (OrderType == "FOR_SALE") ? firstParty : counterOrder.trader;
    return createTradeEntry(buyer, seller, Order.company, count, stockPrice)
        .then(function () {
            return transferOwnership(seller, buyer, Order.company, count, stockPrice)
        })
        .then(function () {
            return closeOrderByCount(counterOrder, count);
        })
}

function transferOwnership(seller, buyer, company, count, stockPrice) {
    return reduceShare(seller, company, count)
        .then(function () {
            return addShare(buyer, company, count)
                .then(function () {
                    return transferBalance(buyer, seller, stockPrice * count)
                    //fix : error on insufficient balance has to be handled
                })
        })
        .catch(function (error) {
            console.log('insufficient share. To be handled')
            //fix: insufficient share. To be handled
        })
}

function transferBalance(sender, receiver, amount) {
    return reduceBalance(sender, amount)
        .then(function () {
            return addBalance(receiver, amount);
        })
}

function addBalance(trader, amount) {
    return getParticipantRegistry('org.yky.stbc.Trader')
        .then(function (traderRegistry) {
            traderRegistry.get(trader.getIdentifier())
                .then(function (trader) {
                    trader.balance += amount;
                    return traderRegistry.update(trader);
                })
        })
}

function reduceBalance(trader, amount) {
    return getParticipantRegistry('org.yky.stbc.Trader')
        .then(function (traderRegistry) {
            traderRegistry.get(trader.getIdentifier())
                .then(function (trader) {
                    if (trader.balance - amount < 0) {
                        return; //throw error; Insufficient balance
                    }
                    trader.balance -= amount;
                    return traderRegistry.update(trader);
                })
        })
}

function createTradeForOrder(Order, OrderType, counterOrders, settlementList) {
    var tradeCreatePromises = [];
    counterOrders.forEach(function (counterOrder) {
        if (settlementList[counterOrder.OrderId]) {
            var buyer = (OrderType == "FOR_SALE") ? counterOrder.trader : Order.trader;
            var seller = (OrderType == "FOR_SALE") ? Order.trader : counterOrder.trader;
            tradeCreatePromises.push(
                createTradeEntry(buyer, seller, Order.company,
                    settlementList[counterOrder.OrderId],
                    counterOrder.price)
            )
        }
    })
    return Promise.all(tradeCreatePromises);
}

function createTradeEntry(buyer, seller, company, count, price) {
    var factory = getFactory();
    var trade = factory.newResource("org.yky.stbc", "Trade", seller.getIdentifier() + "_" +
        buyer.getIdentifier() + "_" + company.getIdentifier() + new Date().getTime().toString());
    trade.company = company;
    trade.buyer = buyer;
    trade.seller = seller;
    trade.count = count;
    trade.price = price;
    return getAssetRegistry("org.yky.stbc.Trade")
        .then(function (tradeRgistry) {
            return tradeRgistry.add(trade)
        })
}

function addShare(holder, company, count) {
    return getAssetRegistry('org.yky.stbc.Share')
        .then(function (shareRegistry) {
            return query('selectShareByUserAndCompany', {
                owner: holder.toURI(),
                company: company.toURI()
            })
                .then(function (shareEntry) {
                    if (shareEntry.length == 0) {
                        return createShare(holder, company, count, shareRegistry);
                    } else {
                        return updateShare(shareEntry[0], shareRegistry, count);
                    }
                })
        })
}

function reduceShare(holder, company, count) {
    return getAssetRegistry('org.yky.stbc.Share')
        .then(function (shareRegistry) {
            return query('selectShareByUserAndCompany', {
                owner: holder.toURI(),
                company: company.toURI()
            })
                .then(function (shareEntry) {
                    if (shareEntry.length == 0 || shareEntry[0].count < count) {
                        return //throw error; Not enough share
                    }
                    if (shareEntry[0].count == count) {
                        return removeShare(shareEntry[0], shareRegistry);
                    }
                    return updateShare(shareEntry[0], shareRegistry, -1 * count);
                })
        })
}

function createShare(holder, company, count, shareRegistry) {
    var share = getFactory().newResource("org.yky.stbc", "Share", holder.getIdentifier() + "_" +
        company.getIdentifier());
    share.count = count;
    share.company = company;
    share.holder = holder;
    return shareRegistry.add(share);
}

function updateShare(share, shareRegistry, count) {
    share.count += count;
    return shareRegistry.update(share);
}

function removeShare(share, shareRegistry) {
    return shareRegistry.remove(share)
}

function addNewOrder(trader, company, count, type, price) {
    if (count <= 0) {
        return;
    }
    var Order = getFactory().newResource("org.yky.stbc", "Order",
        trader.getIdentifier() + "_" +
        new Date().getTime().toString());
    Order.count = count;
    Order.type = type;
    Order.price = price;
    Order.company = company;
    Order.trader = trader;
    return addOrder(Order);
}

function addOrder(Order) {
    return getAssetRegistry('org.yky.stbc.Order')
        .then(function (OrderRegistry) {
            return OrderRegistry.add(Order);
        })
}

function removeOrder(Order) {
    return getAssetRegistry('org.yky.stbc.Order')
        .then(function (OrderRegistry) {
            return OrderRegistry.remove(Order.getIdentifier());
        })
}

function updateOrderCount(prposal, count) {
    return getAssetRegistry('org.yky.stbc.Order')
        .then(function (OrderRegistry) {
            Order.count = count;
            return OrderRegistry.update(Order);
        })
}

function closeOrderByCount(Order, count) {
    if (Order.count < count) {
        return// insufficient ; throw error
    }
    return getAssetRegistry('org.yky.stbc.Order')
        .then(function (OrderRegistry) {
            if (Order.count - count == 0) {
                return OrderRegistry.remove(Order.getIdentifier())
            }
            Order.count -= count;
            return OrderRegistry.update(Order);
        })
}