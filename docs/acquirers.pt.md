# App Linking

## Campos de configurações iniciais

Para configurar o conector chamado "inStore" (para funcionar o App Linking), precisaremos de uma lista de campos abaixo.

### acquirerName

Será o primeiro campo que aparecerá nas configurações do gateway com valores como:
  * Stone
  * Cappta
  * Sitef
  * Virão outros adquirentes (tem que ser alguma lógica fácil de extender)

Dependendo do acquirerName selecionado haverá um conjunto de campos de configuração no gateway que aparecerão para o usuário preencher.

### Campos de configuração por adquirente

Campos para configurar o template de cada adquirente (até o momento):

* Geral (todos os adquirentes terão):
  * acquirerProtocol: string (e.g.: stone, Cappta, vtex-sitef, etc.)
  * scheme: string (já preenchido com "instore" e pode estar hidden do usuário)
  * autoConfirm (já preenchido com "true" e pode estar hidden do usuário, a Stone por exemplo usa isso para avisar a app que não é para pedir confirmação extra do usuário para fazer a transação)
* Stone
  * acquirerId: string (<stone_code>)
* Sitef
  * acquirerId: string (<sitef_storeId>)
* Cappta
  * authKey: string (e.g. "<cappta_authKey>")
  * administrativePassword: string (já preenchido com a senha padrão "cappta")
  * cnpj: string

### Montar a url de ida para cada ação

Segue o padrão da url para applinking (a ser enviado no json de resposta junto com os outros campos do gateway):

```
<acquirerProtocol>://<action>/?<parametros>
```

* action: é uma opção entre configuration, payment e payment-reversal (refund). Lembrando que até essas actions podem ter um nome no objeto alias de cada adquirente.

#### Exemplos de ida para cada ação

Segue exemplos de json de ida para cada ação (sempre com um exemplo de configuração geral como a Stone e de um específico como o da Cappta).

- Exemplo de ação de "configuration" da Stone:

```
{
  acquirerId: "954090369",
  acquirerProtocol: "stone",
  action: "configuration",
  scheme: "instore",
  mobileLinkingUrl: "stone://configuration/?acquirerId=954090369&scheme=instore"
}
```

- Exemplo de ação de "configuration" da Cappta:

```
{
  acquirerProtocol: "Cappta",
  action: "configuration",
  cnpj: "12.243.189/0001-23", // Foi pego do campo acquirerId e transformado via entrada do alias
  scheme: "instore",
  mobileLinkingUrl: "Cappta://configuration/?cnpj=12.243.189%2F0001-23&scheme=instore"
}
```

Para montar esses jsons do gateway, usaremos as rotas já existentes:

* Pegar affiliationId de cada conector (1 objecto ou um array de objetos):
  * https://instore.vtexpayments.com.br/api/pvt/rules?paymentSystemId=45
* Com um affiliationId pegar o mobileLinkingUrl da configuration e qualquer outra configuração do conector (como os tipos de acquirer names) dessa rota:
  * https://instore.vtexpayments.com.br/api/pvt/affiliations/cf56c137-ca6b-4c34-b5e6-e916f157b1b9

- Exemplo de ação de "payment" da Stone:

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
  autoConfirm: "true",
  callbackUrl: "https://dominio/gatewayCallback/.../", // Para mandarmos a resposta, não precisa estar no mobileLinkingUrl
  mobileLinkingUrl: "stone://payment/?acquirerId=954090369&paymentId=1093019888&paymentType=credit&amount=10&installments=3&transactionId=1093019039&autoConfirm=true&scheme=instore"
}
```

- Exemplo de ação de "payment" da Cappta:

```
{
  acquirerProtocol: "Cappta",
  action: "payment",
  cnpj: "12.243.189/0001-23", // Foi pego do campo acquirerId e transformado via entrada do alias
  installments: 1,
  paymentType: "debit",
  amount: 100, // as apps esperam o valor em centavos (1 real)
  transactionId: "1093019040",
  paymentId: "1093019889",
  scheme: "instore",
  autoConfirm: "true",
  callbackUrl: "https://dominio/gatewayCallback/.../", // Para mandarmos a resposta, não precisa estar no mobileLinkingUrl
  mobileLinkingUrl: "Cappta://payment/?cnpj=12.243.189%2F0001-23&paymentId=1093019889&paymentType=debit&amount=100&installments=1&transactionId=1093019040&autoConfirm=true&scheme=instore"
}
```

Para pegar os parâmetros desse json:

* Usar retorno do /execute do fluxo de pagamento

- Exemplo de ação de "payment-reversal" (estorno) da Stone:

```
{
  acquirerProtocol: "stone",
  action: "payment-reversal",
  acquirerId: "954090369",
  transactionId: "1093019039",
  paymentId: "1093019888",
  autoConfirm: "true",
  scheme: "instore",
  callbackUrl: "https://dominio/gatewayCallback/.../", // Para mandarmos a resposta, não precisa estar no mobileLinkingUrl
  mobileLinkingUrl: "stone://payment-reversal/?acquirerId=954090369&paymentId=1093019888&transactionId=1093019039&autoConfirm=true&scheme=instore"
}
```

- Exemplo de ação de "payment-reversal" (estorno) da Cappta:

```
{
  acquirerProtocol: "Cappta",
  action: "payment-reversal",
  cnpj: "12.243.189/0001-23", // Foi pego do campo acquirerId e transformado via entrada do alias
  transactionId: "1093019040",
  paymentId: "1093019889",
  administrativePassword: "cappta", // Ou qualquer outra senha que o dono da loja queira configurar
  administrativeCode: "jabsis179009", // Foi pego nos parametros de volta do app da Cappta e salvo no gateway para esse pagamento
  autoConfirm: "true",
  scheme: "instore",
  callbackUrl: "https://dominio/gatewayCallback/.../", // Para mandarmos a resposta, não precisa estar no mobileLinkingUrl
  mobileLinkingUrl: "Cappta://payment-reversal/?cnpj=12.243.189%2F0001-23&paymentId=1093019889&transactionId=1093019040&administrativePassword=cappta&administrativeCode=jabsis179009&autoConfirm=true&scheme=instore"
}
```

Pegar os parâmetros do json acima nessa rota:

  * Saber previamente a transaction e o payment:
    * https://instore.vtexpayments.com.br/api/pvt/transactions/6CF1B3BD6CCB4F1AAF92759A0A5E0FC6/payments

### Informações que o callbackUrl do gateway receberá como resposta

- Resposta da ação de "configuration" de qualquer adquirente

A ação de configuração só responderá para o inStore um json informando se a configuração foi um sucesso ou não e a app do inStore guardará isso localmente, não precisando chamar o gateway para informar nada.

- Resposta da ação de "payment" da Stone:

A ação de payment gravará a resposta pra pagamento chamando via Post no endpoint do parâmetro callbackUrl passando os parâmetros a serem gravados no Body desse Post.

Parametros de resposta:
  * acquirerProtocol: "stone"
  * action: "payment"
  * acquirerId: string
  * acquirerTid: string (e.g. "<stone_itk>")
  * acquirerAuthorizationCode: string (e.g. "<stone_atk>")
  * merchantReceipt: string (recibo do estabelecimento)
  * customerReceipt: string (recibo do cliente)
  * success: true ou false (gerado pela app, dado a regra de responsecode)
  * responsecode: int (0 significa sucesso e um "numero maior que 0" significa um código de erro do adquirente e nesse caso reason será uma mensagem de erro)
  * reason: string (em caso de sucesso fica vazio e em caso de erro contém a mensagem de erro)

```
Sucesso: POST para callbackUrl com success true e os outros parâmetros
Falhou:  POST para callbackUrl com success false e os outros parâmetros
```

- Resposta da ação de "payment" da Cappta:

Parametros de resposta:
  * acquirerProtocol: "Cappta"
  * action: "payment"
  * administrativeCode: string (e.g. valor para estornar a compra na Cappta)
  * acquirerAuthorizationCode: string (e.g. "<stone_atk>")
  * uniqueSequentialNumber: string (e.g. número do pagamento na Cappta)
  * merchantReceipt: string (recibo do estabelecimento)
  * customerReceipt: string (recibo do cliente)
  * success: true ou false (gerado pela app, dado a regra de responsecode)
  * responsecode: int (0 significa sucesso e um "numero maior que 0" significa um código de erro do adquirente e nesse caso reason será uma mensagem de erro)
  * reason: string (em caso de sucesso fica vazio e em caso de erro contém a mensagem de erro)

```
Sucesso: POST para callbackUrl com success true e os outros parâmetros
Falhou:  POST para callbackUrl com success false e os outros parâmetros
```

- Resposta da ação de "payment-reversal" da Stone:

A ação de "payment-reversal" gravará a resposta pra pagamento chamando via Post no endpoint do parâmetro callbackUrl passando os parâmetros a serem gravados no Body desse Post.

Parametros de resposta:
  * acquirerProtocol: "stone"
  * action: "payment-reversal"
  * paymentId: string (e.g. "1093019888") // para identificar qual operação de estorno foi feita
  * merchantReceipt: string (recibo do estabelecimento do estorno)
  * customerReceipt: string (recibo do cliente do estorno)
  * success: true ou false (gerado pela app, dado a regra de responsecode)
  * responsecode: int (0 significa sucesso e um "numero maior que 0" significa um código de erro do adquirente e nesse caso reason será uma mensagem de erro)
  * reason: string (em caso de sucesso fica vazio e em caso de erro contém a mensagem de erro)

```
Sucesso: POST para callbackUrl com success true e os outros parâmetros
Falhou:  POST para callbackUrl com success false e os outros parâmetros
```

- Resposta da ação de "payment-reversal" da Cappta:

Parametros de resposta:
  * acquirerProtocol: "Cappta"
  * action: "payment-reversal"
  * paymentId: string (e.g. "1093019889") // para identificar qual operação de estorno foi feita
  * merchantReceipt: string (recibo do estabelecimento do estorno)
  * customerReceipt: string (recibo do cliente do estorno)
  * success: true ou false (gerado pela app, dado a regra de responsecode)
  * responsecode: int (0 significa sucesso e um "numero maior que 0" significa um código de erro do adquirente e nesse caso reason será uma mensagem de erro)
  * reason: string (em caso de sucesso fica vazio e em caso de erro contém a mensagem de erro)

```
Sucesso: POST para callbackUrl com success true e os outros parâmetros
Falhou:  POST para callbackUrl com success false e os outros parâmetros
```
