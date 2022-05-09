# faq

## contract doesn't have the expected methods, events etc. or has wrong functionality?
- maybe you have the wrong abi, addresses etc.
- `cp -r ../nft_deals/packages/react-app/src/contracts ./`

## make heroku only run the worker
- manually set it in heroku
- `heroku scale web=0 worker=1`
