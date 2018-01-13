working with a database:
	> mongod --dbpath <path>
		- zažene in/ali ustvari bazo
		- baza teće na localhost:27017

	> mongo
		- se poveže na bazo

	> use events (v mongo konzoli)
		- uporabi kolekcijo events


working with the server:
	> npm start
		- zažene server na localhost:3000

	> npm install <depencendy> (--save) (-g)
		- naloži dependency

	> npm install
		- naloži vse iz package.json

USER MODEL:
    - full name
    - email
    - username
    - password
    - city
    - events:
        - going
        - created

EVENT MODEL:
    - name
    - date
    - location
    - description
    - creator
    - guests

minify:
	- prišparal okoli 13KB
	
test:
    - selenium ide
        - firefox plugin

    - jmeter -> performančni test
        - koliko zahtevkov lahko premore
