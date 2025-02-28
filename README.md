
### JSON-SERVER ###

clear; cd db; json-server users.json --port 8600

clear; cd db; json-server logins.json --port 8700


### KONG ###

docker compose up

KONG_DATABASE=postgres docker compose --profile database up -d


### App Forum ###

clear; cd forum; node_modules/.bin/nodemon app.js

### Authorization ###

http://127.0.0.1:3000/


### Logins ###

//hash 512  
password: ca06915d86817ff6af42c42029856fc30c428a3f309c6f769a8aec84b9867910551323d1b768c9ea8c1b24d24616f40f5eb299e5b6fda3a1147d8bf1a507f323  
senha: <@<j_s:&LZ97,nk8AlpJ  

password: a26e986c0306741058a3ac3d539e4785c8640e4837349654392ac34ca2f30645e7d05ff4a0c6639e44ad440c647dfc20ce4b64eee0ce3ecc085ef8d84a3a5254  
senha: ]g18$779yOmV=V`pw;"~  

password: 4aec7466325086fcfd7e80e9161f4f34bae032b8a2efc955e6af1b1abed0497442aad23be1ee6f2a36739e1cecea3855e646a2f0c042c2300e71f25d5ff5e0b6  
senha: v6gmGa3Tw'}urgS5?SGs  

password: a464fd111b0544594bde53ff9dcee88d55c3b0b1a0b8a120ad8e0d8b012a96b1bb88d2ff5094f10512cff37e9380f2ef21324a19bd5436b1f2d46539c386d349  
senha: 9X%,f(+Sr91BkhnDn77{  


#### Conventional Commits

https://www.conventionalcommits.org/en/v1.0.0/#summary
