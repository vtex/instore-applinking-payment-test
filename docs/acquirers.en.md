# App Linking

This documentation explains how inStore's app execute it's AppLinking feature (android's Intent or RCTLinking on iOS) with the possible actions: `payment` and `payment-reversal` that are sent to the payment app that are integrated with inStore.

## VTEX PCI Gateway

To make the integration work, it's necessary to create an configuration on VTEX Gateway's admin (our payment backend), with all the extra information necessary to the transaction (like the acquirer affiliation id or token).

To create any extra configuration you just need to pass to the instore team (instoredevs@vtex.com.br) what are the extra params needed to your app do the transaction and we will create a form on VTEX Gateway so that the client can configure it.

The AppLinking integration doesn't include any other dependency, since the communication between the inStore app and the payment app happens with specific URIs with all the configuration and payment params that are necessary to do the action.

> Observation:
>
> On Android, all communication must happen with a new `Intent`, so you shouldn't send the response as a `callback` of the initial Intent, instead you should send a new `Intent` to inStore app with the response to the original `Intent`.

## Types of configuration fields

* General (all apps have):
  * acquirerProtocol: string (ex.: stone, cielo-lio, cappta, vtex-sitef, seeed etc.) - AppLinking Protocol (scheme of each payment app)
  * scheme: string (The scheme of the app that the `Intent` with the response will call, that by default will be "instore")
  * autoConfirm (by default its value is "true". Can be used on the payment app to know that the app doesn't need to ask to the user any other permission to do the action)
  * acquirerId: string (ex.:<stone_code>, <sitef_storeId>) affiliation id of the acquirer that is registered on VTEX Gateway

If it's necessary, inStore can send additional information. Example with the acquirer Cappta:

* Cappta
  * authKey: string (e.g. "<cappta_authKey>")
  * authPassword: string (e.g. "<cappta_authPassword>")
  * administrativePassword: string (with default password "cappta")
  * cnpj: string

## Sender URI and Response URI for each action

URI pattern that is sent by the AppLinking:

```
<acquirerProtocol>://<action>?<parametros>
```

URI pattern that is received by the AppLinking:

```
instore://<action>?<parametros_de_resposta>
```

* action: An option between `payment` and `payment-reversal` (refund action to a previous payment).

### Examples of Sender URI for each action

##### - Example for the action "payment":

Context of payment that is used to assemble the URI (so that is easier to read):

```
{
  acquirerProtocol: "super-adquirente",
  action: "payment",
  acquirerId: "954090369",
  installmentType: 2,
  installments: 3,
  paymentId: "1093019888",
  paymentType: "debit",  // could be credit also
  amount: 10, // as apps esperam o valor em centavos (10 centavos)
  installmentsInterestRate: "1%", (se não tiver juros, então não é nem para estar no mobileLinkingUrl)
  transactionId: "1093019039",
  scheme: "instore",
  autoConfirm: "true",
  paymentSystem: 44,
  paymentSystemName: "Venda Direta Debito",
  paymentGroupName: "debitDirectSalePaymentGroup",
  mobileLinkingUrl: "super-adquirente://payment?acquirerId=954090369&paymentId=1093019888&paymentType=debit&amount=10&installments=3&transactionId=1093019039&autoConfirm=true&scheme=instore"
}
```

Final URI with the previous context that the payment app will receive to do the payment:

```
super-adquirente://payment?acquirerProtocol=super-adquirente&action=payment&acquirerId=954090369&installmentType=2&installments=3&paymentId=1093019888&paymentType=debit&amount=10&installmentsInterestRate=1%&transactionId=1093019039&paymentSystem=44&paymentSystemName=Venda%20Direta%20Debito&paymentGroupName=debitDirectSalePaymentGroup&scheme=instore&autoConfirm=true
```

With the response of this AppLinking, will be possible to refund this payment.


##### - Example for the action "payment-reversal" (refund):

Context of the refund that is used to assemble the URI (so that is easier to read):

```
{
  acquirerProtocol: "super-adquirente",
  action: "payment-reversal",
  acquirerId: "954090369",
  transactionId: "1093019039",
  paymentId: "1093019888",
  acquirerTid: "1093019888",
  administrativeCode: "11010103033", // This value is expected to be received from the payment and is saved on VTEX Gateway
  autoConfirm: "true",
  scheme: "instore",
  mobileLinkingUrl: "super-adquirente://payment-reversal?acquirerId=954090369&paymentId=1093019888&transactionId=1093019039&autoConfirm=true&scheme=instore"
}
```

Final URI with the previous context that the payment app will receive to do the refund:

```
super-adquirente://payment-reversal?acquirerId=954090369&transactionId=1093019039&paymentId=1093019888&acquirerTid=1093019888&administrativeCode=11010103033&autoConfirm=true&scheme=instore
```

> Observation:
>
> Not all parameters will be used by all acquirers / payment apps. Example:
> • transactionId: The id of a VTEX transaction that identifies all the payments of an entire order on VTEX gateway. A transaction can contain several payments, like when an order is paid with multiple credit or debit cards.


### Examples of Response URI for each action

##### - Example of a response for the action "payment":

URI:

```
Success: instore://payment?responsecode=0&<parametros_de_resposta>
Failed:   instore://payment?responsecode=110&reason=erro+no+cartao+cancelado+pelo+cliente&paymentId=<value_of_the_sender_URI>
```

Response parameters:
  * scheme: "instore"
  * action: "payment"
  * paymentId: string (identification of the payment on VTEX)
  * cardBrandName: string (name of the card brand, like "mastercard", "visa", etc.)
  * acquirerName: string (name of the acquirer - optional)
  * acquirerTid: string (identification of the payment on the acquirer)
  * acquirerAuthorizationCode or administrativeCode: string (authorization code that the app will receive on a refund action to authorize it)
  * merchantReceipt: string (receipt text to the merchant, that should be encoded on the URI)
  * customerReceipt: string (receipt text to the customer, that should be encoded on the URI)
  * responsecode: int (0 means success and "a value bigger than 0" means an error code of the acquirer and in this case the parameter "reason" will be an error message)
  * reason: string (in case of success it's value is empty and in case of an error this contains an error message)
  * success: true or false (generated by the app given the value on responsecode)


##### - Example of a response for the action "payment-reversal" (refund):

URI:

```
Success: instore://payment-reversal?responsecode=0&<parametros_de_resposta>
Failed:   instore://payment-reversal?responsecode=110&reason=erro+no+cartao+cancelado+pelo+cliente&paymentId=<valor_enviado_na_ida>
```

Response parameters:
  * scheme: "instore"
  * action: "payment-reversal"
  * paymentId: string (e.g. "1093019888") to identify what payment was refunded
  * acquirerAuthorizationCode or administrativeCode: string (authorization code that an acquirer can also give to an refund)
  * merchantReceipt: string (receipt text to the merchant for the refund, that should be encoded on the URI)
  * customerReceipt: string (receipt text to the customer for the refund, that should be encoded on the URI)
  * responsecode: int (0 means success and "a value bigger than 0" means an error code of the acquirer and in this case the parameter "reason" will be an error message)
  * reason: string (in case of success it's value is empty and in case of an error this contains an error message)
  * success: true or false (generated by the app given the value on responsecode)
