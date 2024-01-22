# ebsi-access-control

Launch this to create a private key for a new user
openssl ecparam -name secp256k1 -genkey -noout -out ec-secp256k1-priv-key.pem

Launch this to create the private key for anoth
openssl ec -in ec-secp256k1-priv-key.pem -pubout > ec-secp256k1-pub-key.pem