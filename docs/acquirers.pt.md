# App Linking

Esse documento explica como a app do inStore configurará e fará o AppLinking para as ações de: `configuration`, `payment` e `payment-reversal` com as apps dos adquirentes.


## Gateway da VTEX

Para que a integração funcione com uma determinada loja, é preciso que o cliente cadastre no gateway da VTEX (nosso backend) o código da adquirente que deseja utilizar (acquirer id).

A integração via AppLinking não inclui nenhuma dependência extra, uma vez que a comunicação entre o inStore e a app de pagamento acontece através de chamadas para URIs específicas passando todos os parâmetros necessários para a realizar a ação.

> Observação:
>
> No Android, toda a comunicação acontece através de uma nova `Intent`, ou seja, mesmo as respostas de uma ação são enviadas através de uma `Intent` nova, não no `callback` da primeira.

## Campos de configuração

* Geral (todos os adquirentes terão):
  * acquirerProtocol: string (ex.: stone, cielo-lio, cappta, vtex-sitef, etc.) - qual o protocolo do applinking (scheme de cada app)
  * scheme: string (protocolo para as respostas já preenchido por padrão com o protocolo "instore" que é a app da vtex que fará a integração com os adquirentes)
  * autoConfirm (já preenchido por padrão com "true". Pode ser utilizado para avisar a app que não é necessário pedir confirmação extra do usuário para fazer a transação)
  * acquirerId: string (ex.:<stone_code>, <sitef_storeId>) id da afiliação cadastrado no gateway da VTEX

Se for necessário, podemos enviar informações específicas que sejam importantes para a adquirente. Exemplo:

* Cappta
  * authKey: string (e.g. "<cappta_authKey>")
  * authPassword: string (e.g. "<cappta_authPassword>")
  * administrativePassword: string (já preenchido com a senha padrão "cappta")
  * cnpj: string

## Montar a url de ida e volta para cada ação

Padrão da url de ida do applinking:

```
<acquirerProtocol>://<action>/?<parametros>
```

Padrão da url de volta do applinking:

```
instore://<action>/?<parametros_de_resposta>
```

* action: é uma opção entre `configuration`, `payment` e `payment-reversal` (ação de estorno de um pagamento).

### Exemplos de ida para cada ação

##### - Exemplo de ação de "configuration":

Contexto de configuração usado para montar a URL:

```
{
  acquirerProtocol: "super-adquirente",
  action: "configuration",
  acquirerId: "954090369",
  scheme: "instore",
  mobileLinkingUrl: "super-adquirente://configuration/?acquirerId=954090369&scheme=instore"
}
```

URL:

```
super-adquirente://configuration/?acquirerProtocol=super-adquirente&action=configuration&acquirerId=954090369&scheme=instore
```


##### - Exemplo de ação de "payment":

Contexto do pagamento usado para montar a URL:

```
{
  acquirerProtocol: "super-adquirente",
  action: "payment",
  acquirerId: "954090369",
  installmentType: 2,
  installments: 3,
  paymentId: "1093019888",
  paymentType: "credit",
  amount: 10, // as apps esperam o valor em centavos (10 centavos)
  installmentsInterestRate: "1%", (se não tiver juros, então não é nem para estar no mobileLinkingUrl)
  transactionId: "1093019039",
  scheme: "instore",
  autoConfirm: "true",
  paymentSystem: 44,
  paymentSystemName: "Venda Direta Debito",
  paymentGroupName: "debitDirectSalePaymentGroup",
  callbackUrl: "https://dominio/gatewayCallback/.../", // Para mandarmos a resposta, não precisa estar no mobileLinkingUrl
  mobileLinkingUrl: "super-adquirente://payment/?acquirerId=954090369&paymentId=1093019888&paymentType=credit&amount=10&installments=3&transactionId=1093019039&autoConfirm=true&scheme=instore"
}
```

URL:

```
super-adquirente://payment?acquirerProtocol=super-adquirente&action=payment&acquirerId=954090369&installmentType=2&installments=3&paymentId=1093019888&paymentType=credit&amount=10&installmentsInterestRate=1%&transactionId=1093019039&paymentSystem=44&paymentSystemName=Venda%20Direta%20Debito&paymentGroupName=debitDirectSalePaymentGroup&scheme=instore&autoConfirm=true
```

Com os valores de resposta para o pagamento, será possível fazer o estorno.


##### - Exemplo de ação de "payment-reversal" (estorno):

Contexto do estorno:

```
{
  acquirerProtocol: "super-adquirente",
  action: "payment-reversal",
  acquirerId: "954090369",
  transactionId: "1093019039",
  paymentId: "1093019888",
  acquirerTid: "1093019888",
  administrativeCode: "11010103033", // Foi pego nos parâmetros de volta do pagamento e salvo no gateway
  autoConfirm: "true",
  scheme: "instore",
  callbackUrl: "https://dominio/gatewayCallback/.../", // Para mandarmos a resposta, não precisa estar no mobileLinkingUrl
  mobileLinkingUrl: "super-adquirente://payment-reversal/?acquirerId=954090369&paymentId=1093019888&transactionId=1093019039&autoConfirm=true&scheme=instore"
}
```

URL:

```
super-adquirente://payment-reversal/?acquirerId=954090369&transactionId=1093019039&paymentId=1093019888&acquirerTid=1093019888&administrativeCode=11010103033&autoConfirm=true&scheme=instore
```

> Observação:
>
> Nem todos os parâmetros que o VTEX inStore envia serão utilizados por todas as adquirentes. Exemplo:
> • transactionId: É a identificação da transação. Uma transação pode conter vários pagamentos, uma vez que a compra tenha sido dividida em vários cartões, então esse código identifica a compra inteira no gateway da VTEX.


### Respostas das ações

##### - Exemplo de resposta da ação de "configuration":


URL:

```
Successo: instore://configuration/?responsecode=0
Falhou:   instore://configuration/?responsecode=100&reason=codigo+100+problema+no+pinpad
```

##### - Exemplo de resposta da ação de "payment":

URL:

```
Successo: instore://payment?responsecode=0&<parametros_de_resposta>
Falhou:   instore://payment?responsecode=110&reason=erro+no+cartao+cancelado+pelo+cliente&paymentId=<valor_enviado_na_ida>
```

Parâmetros de resposta:
  * scheme: "instore"
  * action: "payment"
  * paymentId: string (identificação do pagamento na VTEX)
  * acquirerTid: string (número que identifica o pagamento na adquirente)
  * acquirerAuthorizationCode ou administrativeCode: string (código de autorização que recebemos da adquirente no pagamento e repassamos no momento do estorno)
  * merchantReceipt: string (recibo do estabelecimento)
  * customerReceipt: string (recibo do cliente)
  * responsecode: int (0 significa sucesso e um "numero maior que 0" significa um código de erro do adquirente e nesse caso reason será uma mensagem de erro)
  * reason: string (em caso de sucesso fica vazio e em caso de erro contém a mensagem de erro)
  * success: true ou false (gerado pela app, dado a regra de responsecode)


##### - Exemplo de resposta da ação de "payment-reversal":

URL:

```
Successo: instore://payment-reversal/?responsecode=0&<parametros_de_resposta>
Falhou:   instore://payment-reversal/?responsecode=110&reason=erro+no+cartao+cancelado+pelo+cliente&paymentId=<valor_enviado_na_ida>
```

Parâmetros de resposta:
  * scheme: "instore"
  * action: "payment-reversal"
  * paymentId: string (e.g. "1093019888") para identificar qual pagamento foi estornado
  * acquirerAuthorizationCode ou administrativeCode: string (código de autorização que recebemos da adquirente no pagamento e repassamos no momento do estorno)
  * merchantReceipt: string (recibo do estabelecimento do estorno)
  * customerReceipt: string (recibo do cliente do estorno)
  * responsecode: int (0 significa sucesso e um "número maior que 0" significa um código de erro do adquirente e nesse caso reason será uma mensagem de erro)
  * reason: string (em caso de sucesso fica vazio e em caso de erro contém a mensagem de erro)
  * success: true ou false (gerado pela app, dado a regra de responsecode)
