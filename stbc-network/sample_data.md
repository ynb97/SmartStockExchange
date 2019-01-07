
<!-- Participant Company -->
{
  "$class": "org.yky.stbc.Company",
  "issuedShareCount": 0,
  "owner": "resource:org.yky.stbc.Trader#owner@abc.com",
  "email": "company@abc.com",
  "name": "ABC Corporation"
}

{
  "$class": "org.yky.stbc.Company",
  "issuedShareCount": 0,
  "owner": "resource:org.yky.stbc.Trader#owner@xyz.com",
  "email": "company@xyz.com",
  "name": "XYZ"
}

<!-- Participant Trader -->

{
  "$class": "org.yky.stbc.Trader",
  "balance": 10000,
  "email": "owner@abc.com",
  "name": "Owner ABC"
}
  
{
  "$class": "org.yky.stbc.Trader",
  "balance": 50000,
  "email": "owner@xyz.com",
  "name": "Owner XYZ"
}

<!-- Transaction ShareIssue -->

{
  "$class": "org.yky.stbc.ShareIssue",
  "detail": "First Share Issue of ABC",
  "count": 3,
  "price": 10,
  "company": "resource:org.yky.stbc.Company#company@abc.com"
}

{
  "$class": "org.yky.stbc.ShareIssue",
  "detail": "First Share Issue of XYZ",
  "count": 3,
  "price": 10,
  "company": "resource:org.yky.stbc.Company#company@xyz.com"
}

<!-- Transaction PlaceOrder -->

<!-- Transaction ModifyOrder -->