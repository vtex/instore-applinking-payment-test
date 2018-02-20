# App Linking

This document explains how the inStore app executes its AppLinking feature (`Intent` on Android or `RCTLinking` on iOS) with the available actions—`payment` and `payment-reversal`—that are sent to the payment app integrated with inStore.

## VTEX PCI Gateway

To make the integration work, it's necessary to create a configuration on the VTEX Gateway admin (our payment backend), with all the extra information necessary for the transaction (for example, the acquirer affiliation id or token).

To create any extra configuration, you need to send to the inStore team (instoredevs@vtex.com.br) the extra params your app needs in order to complete the transaction, and we will create a form on VTEX Gateway so that the customer can configure it.

The AppLinking integration doesn't include any other dependencies, since the communication between the inStore app and the payment app happens with specific URIs containing all the configuration and payment parameters necessary for the action.

> Observation:
>
> On Android, all communication must happen with a new `Intent`; that is, you shouldn't send the response as a `callback` of the initial `Intent`. Instead, you should send a new `Intent` to the inStore app with the response of the previous one.

## Types of configuration fields

* General (all apps have):
  * `acquirerProtocol`: string (the AppLinking protocol—that is, the scheme of the payment app; e.g., `stone`, `cielo-lio`, `cappta`)
  * `scheme`: string (defaults to `instore`. The scheme which the `Intent` of the payment apps will respond to)
  * `autoConfirm`: boolean (default is `true`. Indicates to the app it doesn't need to ask the user any additional permission in order to complete the action)
  * `acquirerId`: string (affiliation id of the acquirer that is registered on VTEX Gateway, e.g. `<stone_code>`, `<sitef_storeId>`)

If necessary, inStore can send additional information. Example with the acquirer Cappta:

* Cappta
  * `authKey`: string (e.g. `<cappta_authKey>`)
  * `authPassword`: string (e.g. `<cappta_authPassword>`)
  * `administrativePassword`: string (with default password `cappta`)
  * `cnpj`: string


## Sender URI and Response URI for each action

URI pattern that is sent by the AppLinking:

```
<acquirerProtocol>://<action>?<params>
```

URI pattern that is received by the AppLinking:

```
instore://<action>?<response_params>
```

* action: Either `payment` or `payment-reversal` (i.e. refund action to a previous payment).

### Examples of Sender URI for each action

##### - Example for the action `payment`:

Context of payment that is used to assemble the URI (so that is easier to read):

```
{
  acquirerProtocol: "super-acquirer",
  action: "payment",
  acquirerId: "954090369",
  installmentType: 2, // 1: The interests are for each installments are from the bank or credit card administrator and 2: the store assume any interest for the installments
  installments: 3,
  paymentId: "1093019888",
  paymentType: "debit",  // could also be credit
  amount: 10, // payment apps usually expect the amount in cents (10 cents in this example)
  installmentsInterestRate: "1%", (if the order doesn't have interest rate, it shouldn't be on the mobileLinkingUrl)
  transactionId: "1093019039",
  scheme: "instore",
  autoConfirm: "true",
  paymentSystem: 44,
  paymentSystemName: "Venda Direta Debito",
  paymentGroupName: "debitDirectSalePaymentGroup",
  mobileLinkingUrl: "super-acquirer://payment?acquirerId=954090369&paymentId=1093019888&paymentType=debit&amount=10&installments=3&transactionId=1093019039&autoConfirm=true&scheme=instore"
}
```

Final URI with the previous context the payment app will receive in order to execute the payment action:

```
super-acquirer://payment?acquirerProtocol=super-acquirer&action=payment&acquirerId=954090369&installmentType=2&installments=3&paymentId=1093019888&paymentType=debit&amount=10&installmentsInterestRate=1%&transactionId=1093019039&paymentSystem=44&paymentSystemName=Venda%20Direta%20Debito&paymentGroupName=debitDirectSalePaymentGroup&scheme=instore&autoConfirm=true
```

With the response of this AppLinking, will be possible to refund this payment.


##### - Example for the action `payment-reversal` (refund):

Context of the refund that is used to assemble the URI (so that is easier to read):

```
{
  acquirerProtocol: "super-acquirer",
  action: "payment-reversal",
  acquirerId: "954090369",
  transactionId: "1093019039",
  paymentId: "1093019888",
  acquirerTid: "1093019888",
  administrativeCode: "11010103033", // This value is expected to be received from the payment and is saved on the VTEX Gateway
  autoConfirm: "true",
  scheme: "instore",
  mobileLinkingUrl: "super-acquirer://payment-reversal?acquirerId=954090369&paymentId=1093019888&transactionId=1093019039&autoConfirm=true&scheme=instore"
}
```

Final URI with the previous context that the payment app will receive in order to execute the refund action:

```
super-acquirer://payment-reversal?acquirerId=954090369&transactionId=1093019039&paymentId=1093019888&acquirerTid=1093019888&administrativeCode=11010103033&autoConfirm=true&scheme=instore
```

> Observation:
>
> Not all parameters will be used by all acquirers / payment apps. Example:
>
> • `transactionId`: The id of a VTEX transaction that identifies all the payments of an entire order on VTEX gateway. A transaction may contain several payments, as when an order is paid with multiple credit or debit cards.


### Examples of Response URI for each action

##### - Example of a response for the action "payment":

URI:

```
Success: instore://payment?responsecode=0&<response_params>
Failed:  instore://payment?responsecode=110&reason=card+refused+by+acquirer&paymentId=<value_of_the_sender_URI>
```

Response parameters:
  * `scheme`: "instore"
  * `action`: "payment"
  * `paymentId`: string (identification of the payment on VTEX)
  * `cardBrandName`: string (name of the card brand, like "mastercard", "visa", etc.)
  * `acquirerName`: string (name of the acquirer - optional)
  * `acquirerTid`: string (identification of the payment on the acquirer)
  * `acquirerAuthorizationCode` or `administrativeCode`: string (authorization code needed in order to authorize a refund action)
  * `merchantReceipt`: string (receipt text to the merchant, that should be encoded on the URI)
  * `customerReceipt`: string (receipt text to the customer, that should be encoded on the URI)
  * `responsecode`: int (`0` means success; values greater than `0` mean error codes of the acquirer, and in that case the parameter `reason` will be an error message)
  * `reason`: string (in case of success its value is empty; in case of error it contains the error message)
  * `success`: `true` or `false` (generated by the app given the value of `responsecode`)


##### - Example of a response for the action `payment-reversal` (refund):

URI:

```
Success: instore://payment-reversal?responsecode=0&<response_params>
Failed:  instore://payment-reversal?responsecode=110&reason=card+refused+by+acquirer&paymentId=<id_sent_previously>
```

Response parameters:
  * `scheme`: `instore`
  * `action`: `payment-reversal`
  * `paymentId`: string (e.g. `1093019888`) to identify which payment was refunded
  * `acquirerAuthorizationCode` or `administrativeCode`: string (authorization code that was used for the refund action)
  * `merchantReceipt`: string (receipt text of the refund for the merchant, that should be encoded on the URI)
  * `customerReceipt`: string (receipt text of the refund for the customer, that should be encoded on the URI)
  * `responsecode`: int (`0` means success; values greater than `0` mean error codes of the acquirer, and in that case the parameter `reason` will be an error message)
  * `reason`: string (in case of success its value is empty; in case of error it contains the error message)
  * `success`: `true` or `false` (generated by the app given the value on `responsecode`)

