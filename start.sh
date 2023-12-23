# transpile the typescript files to javascript, in build folder
# then run the server

# transpile
tsc

# run the server
node --env-file=.env build/index.js

# end of file
