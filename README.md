# ebsi-access-control

Launch this to create a private key for a new user
```openssl ecparam -name secp256k1 -genkey -noout -out ec-secp256k1-priv-key.pem```

Launch this to create the private key for anoth
```openssl ec -in ec-secp256k1-priv-key.pem -pubout > ec-secp256k1-pub-key.pem```

This command gives the user important infos on the private key to use in metamask to import his own account
It needs to take the priv part, remove the : char and put a 0x before the string (if it starts with 00 it needs to be removed)
```openssl ec -text -noout -in ec-key.pem```

This will return something like this:
read EC key
Private-Key: (256 bit)
priv:
    ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:
    ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:ff:
    ff:ff

which can be used as a private key for metamask as explained above.
