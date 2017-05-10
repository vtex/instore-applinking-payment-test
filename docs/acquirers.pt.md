# App Linking

Esse documento explica como a app do inStore configurará e fará o applinking para as ações de: configuration, payment e payment-reversal com as apps dos adquirentes.

## Campos de configuração por adquirente

Configuração inicial no gateway da VTEX (nosso backend) para os adquirentes:

* Geral (todos os adquirentes terão):
  * acquirerProtocol: string (e.g.: stone, cielo-lio, cappta, vtex-sitef, etc.) - qual o protocolo do applinking (scheme de cada app)
  * scheme: string (protocolo para as respostas já preenchido por padrão com o protocolo "instore" que é a app da vtex que fará a integração com os adquirentes)
  * autoConfirm (já preenchido por padrão com "true")
* Stone
  * acquirerId: string (<stone_code>)
* Cielo Lio
  * acquirerId: string
* Sitef
  * acquirerId: string (<sitef_storeId>)
* Cappta
  * authKey: string (e.g. "<cappta_authKey>")
  * administrativePassword: string (já preenchido com a senha padrão "cappta")
  * cnpj: string

## Montar a url de ida e volta para cada ação

Segue o padrão da url de ida do applinking:

```
<acquirerProtocol>://<action>/?<parametros>
```

Segue o padrão da url de volta do applinking:

```
instore://<action>/?<parametros_de_resposta>
```

* action: é uma opção entre configuration, payment e payment-reversal (ação de estorno de um pagamento).

### Exemplos de ida para cada ação

Segue exemplos de ida para apps da Stone, Cielo Lio e Cappta.

- Exemplo de ação de "configuration" da Stone:

URL:

```
stone://configuration/?acquirerId=954090369&scheme=instore
```

- Exemplo de ação de "configuration" da Cielo Lio:

URL:

```
cielo-lio://configuration/?acquirerId=954090369&scheme=instore
```

- Exemplo de ação de "configuration" da Cappta:

URL:

```
cappta://configuration/?cnpj=12.243.189%2F0001-23&scheme=instore
```

- Exemplo de ação de "payment" da Stone:

Contexto do pagamento usado para montar a URL:

```
{
  acquirerProtocol: "stone",
  action: "payment",
  acquirerId: "954090369",
  installments: 3,
  paymentType: "credit",
  amount: 10, // as apps esperam o valor em centavos (10 centavos)
  installmentsInterestRate: "1%", (se não tiver juros, então não é nem para estar no mobileLinkingUrl)
  transactionId: "1093019039",
  paymentId: "1093019888",
  scheme: "instore",
  autoConfirm: "true"
}
```

URL:

```
stone://payment/?acquirerId=954090369&paymentId=1093019888&paymentType=credit&amount=10&installments=3&transactionId=1093019039&autoConfirm=true&scheme=instore
```

- Exemplo de ação de "payment" da Cielo Lio:

Contexto do pagamento usado para montar a URL:

```
{
  acquirerProtocol: "cielo-lio",
  action: "payment",
  acquirerId: "954090369",
  installments: 3,
  paymentType: "credit",
  amount: 10, // as apps esperam o valor em centavos (10 centavos)
  installmentsInterestRate: "1%", (se não tiver juros, então não é nem para estar no mobileLinkingUrl)
  transactionId: "1093019039",
  paymentId: "1093019888",
  scheme: "instore",
  autoConfirm: "true"
}
```

URL:

```
cielo-lio://payment/?acquirerId=954090369&paymentId=1093019888&paymentType=credit&amount=10&installments=3&transactionId=1093019039&autoConfirm=true&scheme=instore
```

- Exemplo de ação de "payment" da Cappta:

Contexto do pagamento usado para montar a URL:

```
{
  acquirerProtocol: "Cappta",
  action: "payment",
  cnpj: "12.243.189/0001-23",
  installments: 1,
  paymentType: "debit",
  amount: 100, // as apps esperam o valor em centavos (1 real)
  transactionId: "1093019040",
  paymentId: "1093019889",
  scheme: "instore",
  autoConfirm: "true"
}
```

URL:

```
cappta://payment/?cnpj=12.243.189%2F0001-23&paymentId=1093019889&paymentType=debit&amount=100&installments=1&transactionId=1093019040&autoConfirm=true&scheme=instore
```

Com os valores de resposta para o pagamento, será possível fazer o estorno.

- Exemplo de ação de "payment-reversal" (estorno) da Stone:

Contexto do estorno:

```
{
  acquirerProtocol: "stone",
  action: "payment-reversal",
  acquirerId: "954090369",
  transactionId: "1093019039",
  paymentId: "1093019888",
  acquirerTid: "1093019888",
  acquirerAuthorizationCode: "1093019880"
  autoConfirm: "true",
  scheme: "instore",
}
```

URL:

```
cielo-lio://payment-reversal/?acquirerId=954090369&paymentId=1093019888&acquirerTid=1093019888&acquirerAuthorizationCode=1093019880&transactionId=1093019039&autoConfirm=true&scheme=instore
```

- Exemplo de ação de "payment-reversal" (estorno) da Cielo Lio:

Contexto do estorno:

```
{
  acquirerProtocol: "cielo-lio",
  action: "payment-reversal",
  acquirerId: "954090369",
  transactionId: "1093019039",
  paymentId: "1093019888",
  acquirerTid: "1093019888",
  acquirerAuthorizationCode: "1093019880"
  autoConfirm: "true",
  scheme: "instore",
}
```

URL:

```
cielo-lio://payment-reversal/?acquirerId=954090369&paymentId=1093019888&acquirerTid=1093019888&acquirerAuthorizationCode=1093019880&transactionId=1093019039&autoConfirm=true&scheme=instore
```

- Exemplo de ação de "payment-reversal" (estorno) da Cappta:

Contexto do estorno:

```
{
  acquirerProtocol: "Cappta",
  action: "payment-reversal",
  cnpj: "12.243.189/0001-23",
  transactionId: "1093019040",
  paymentId: "1093019889",
  administrativePassword: "cappta", // Ou qualquer outra senha que o dono da loja queira configurar
  administrativeCode: "jabsis179009", // Foi pego nos parametros de volta do app da Cappta e salvo no gateway para esse pagamento
  autoConfirm: "true",
  scheme: "instore",
}
```

URL:

```
cappta://payment-reversal/?cnpj=12.243.189%2F0001-23&paymentId=1093019889&transactionId=1093019040&administrativePassword=cappta&administrativeCode=jabsis179009&autoConfirm=true&scheme=instore
```

### Respostas das ações

- Exemplo de resposta da ação de "configuration" para qualquer adquirente

URL:

```
Successo: instore://configuration/?responsecode=0
Falhou:   instore://configuration/?responsecode=100&reason=codigo+100+problema+no+pinpad
```

- Exemplo de resposta da ação de "payment" da Stone, Cielo Lio e Cappta:

URL:

```
Successo: instore://payment/?responsecode=0&<parametros_de_resposta>
Falhou:   instore://payment/?responsecode=110&reason=erro+no+cartao+cancelado+pelo+cliente&paymentId=<valor_enviado_na_ida>
```

Parametros de resposta da Stone:
  * scheme: "instore"
  * action: "payment"
  * paymentId: string (o mesmo enviado na ação de ida)
  * acquirerTid: string (e.g. "<stone_itk>")
  * acquirerAuthorizationCode: string (e.g. "<stone_atk>")
  * merchantReceipt: string (recibo do estabelecimento)
  * customerReceipt: string (recibo do cliente)
  * responsecode: int (0 significa sucesso e um "numero maior que 0" significa um código de erro do adquirente e nesse caso reason será uma mensagem de erro)
  * reason: string (em caso de sucesso fica vazio e em caso de erro contém a mensagem de erro)

Parametros de resposta da Cielo Lio:
  * scheme: "instore"
  * action: "payment"
  * paymentId: string (o mesmo enviado na ação de ida)
  * acquirerTid: string (número que identifica o pagamento para a Cielo)
  * acquirerAuthorizationCode: string (número que autoriza o estorno para a Cielo)
  * merchantReceipt: string (recibo do estabelecimento)
  * customerReceipt: string (recibo do cliente)
  * responsecode: int (0 significa sucesso e um "numero maior que 0" significa um código de erro do adquirente e nesse caso reason será uma mensagem de erro)
  * reason: string (em caso de sucesso fica vazio e em caso de erro contém a mensagem de erro)

Parametros de resposta da Cappta:
  * scheme: "instore"
  * action: "payment"
  * paymentId: string (o mesmo enviado na ação de ida)
  * administrativeCode: string (e.g. valor para estornar a compra na Cappta)
  * acquirerAuthorizationCode: string (e.g. "<stone_atk>")
  * uniqueSequentialNumber: string (e.g. número do pagamento na Cappta)
  * merchantReceipt: string (recibo do estabelecimento)
  * customerReceipt: string (recibo do cliente)
  * responsecode: int (0 significa sucesso e um "numero maior que 0" significa um código de erro do adquirente e nesse caso reason será uma mensagem de erro)
  * reason: string (em caso de sucesso fica vazio e em caso de erro contém a mensagem de erro)

- Exemplo de resposta da ação de "payment-reversal" da Stone, Cielo Lio e Cappta:

URL:

```
Successo: instore://payment-reversal/?responsecode=0&<parametros_de_resposta>
Falhou:   instore://payment-reversal/?responsecode=110&reason=erro+no+cartao+cancelado+pelo+cliente&paymentId=<valor_enviado_na_ida>
```

Parametros de resposta da Stone:
  * scheme: "instore"
  * action: "payment-reversal"
  * paymentId: string (e.g. "1093019888") // para identificar qual operação de estorno foi feita
  * merchantReceipt: string (recibo do estabelecimento do estorno)
  * customerReceipt: string (recibo do cliente do estorno)
  * responsecode: int (0 significa sucesso e um "numero maior que 0" significa um código de erro do adquirente e nesse caso reason será uma mensagem de erro)
  * reason: string (em caso de sucesso fica vazio e em caso de erro contém a mensagem de erro)

Parametros de resposta da Cielo Lio:
  * scheme: "instore"
  * action: "payment-reversal"
  * paymentId: string (e.g. "1093019888") // para identificar qual operação de estorno foi feita
  * merchantReceipt: string (recibo do estabelecimento do estorno)
  * customerReceipt: string (recibo do cliente do estorno)
  * responsecode: int (0 significa sucesso e um "numero maior que 0" significa um código de erro do adquirente e nesse caso reason será uma mensagem de erro)
  * reason: string (em caso de sucesso fica vazio e em caso de erro contém a mensagem de erro)

Parametros de resposta da Cappta:
  * scheme: "instore"
  * action: "payment-reversal"
  * paymentId: string (e.g. "1093019889") // para identificar qual operação de estorno foi feita
  * merchantReceipt: string (recibo do estabelecimento do estorno)
  * customerReceipt: string (recibo do cliente do estorno)
  * responsecode: int (0 significa sucesso e um "numero maior que 0" significa um código de erro do adquirente e nesse caso reason será uma mensagem de erro)
  * reason: string (em caso de sucesso fica vazio e em caso de erro contém a mensagem de erro)
