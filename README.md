# TODO

## **Things to do/try**
* !!SOLVED!! Worker closing 20 seconds after container is opened, container closing?
SOLUTION: Too many connections in go sql thing, needed to start and kill the connection in the main loop.
	1) Try running the docker file locally and see if it does the same thing.
 	2) Honestly, might not even need the dockerfile. That might be creating some kind of weird container issue. There might be an issue with the file structure if you go with no DOCKERFILE but that could be fixed by shmooving the main.go file down a level, the packs should still be able to be found easily enough. But, if there is no dockerfile then the assumption is that how it works locally should line up 1:1 with how it works in prod. Nixpacks says they are able to build anything with no problems but that doesnt seem right.
  	3) There is a chance that the logs might be messing with things, might need to default to fmt rather than logs (or vice-versa, I cant remeber) and that might help with its health check stuff.
 	4) See if the start up command might be messing with things: [https://stackoverflow.com/questions/65377204/docker-container-exits-after-few-seconds]
  	5) Check the resourses that the worker is using, it might be taking up too many and railway is cutting the connection?

* Create SSE stream to send notifications from the server to the client.
	1) Web sockets are an option but since the server is also acting as an API and the requests are kinda spread out I dont think we need to go that hard.
	2) SSE should be pretty easy to implement, just need to set up the connection on load and then set up the server side stuff to send an event whenever there is an event.
 	3) Maybe there could be some issues with ports but given that its really just a route with goofy headers I dont think it should really be much of an issue.
	4) Figure out how to watch the database for changes so that alerts can be sent to the client from the server based on how the worker changes the database.
		* Maybe this?: [https://github.com/rodrigogs/mysql-events?tab=readme-ov-file] Someone said that you might need to move ini file locations around which might not work in railway.
  			* In order to use this you need to alter the sql startup command to include the binary logs. There will likely be issues with this beacuse mysql does not clean up these files and will quickly bloat your database. Try to figure out a good time to run `PURGE BINARY LOGS` which has some good configs which let you pruge logs before a certain date. Possibly have a trigger in the worker or set up a cron job. Setting up a cron job could be fun and easy. Could do both and find a way to run a script that checks if there are too many logs and then purge them if there are too many. [https://dev.mysql.com/doc/refman/8.4/en/purge-binary-logs.html]
  		* Also make sure to not check the entire database every time or else you might kill the server.
	5) Setting up the stream handler on the client side should not be that difficult. Seems pretty easy [https://shaxadd.medium.com/effortless-real-time-updates-in-react-with-server-sent-events-a-step-by-step-guide-using-node-js-52ecff6d828e]

* Create an event page to show users what event are coming up.
	1) This is more important than it seems, events are pretty much pointless if no one knows that they are coming.
		* Event type
  		* Event name
		* Event start time
	2) Should be pretty easy to implement, just need to create a command (or possibly a whole new page?) that makes a get request to the server.
	3) Create a server route to handle getting upcoming events, should just send on object with the above data in order by date.
 	4) Reference the above link for information on implementing sse on the client side. Like I said, this part should be pretty easy.
	5) After this is implemented it might be a good idea to include event stuff in the ticker, maybe just have the next event with some text like "Next Event: Date-Time"

* Bug test Bug test Bug test.
	* Get as many people as possibile to try and break your site, better it breaks now than it breaking when the important people are testing it.
 	* Some possible groups to send it to:
		* NCR
  		* Friends
    		* Work (they are going to chew this apart)
    		* Family?
      		* People on reddit?
        	* Linked in? (Probably wont really provide useful insight but posting stuff on there is good.)
   
## **Small Things**
* Refactor
	* Move routes to new file.
 	* Break server commands into different files based on what they do. Keep the command interpreter but have it point to different functions. Maybe move the command case interpreter but have it point to different files so that each command can have its own function, that makes the most sense.
  	* Get rid of all the comments, it makes it look AI generated.
* Small features
	* Add some ASCII art that pops up when you open the page or refresh.

## **User Purchase**
* The code for this should already be in the repo, just unused. 
* All user stocks are stored as "carrots" in the carrots table, with FK to the user and the option.
* The user should not ever be able to have two carrots for the same option, if they get an option it should be added to their current carrot.
	* The carrot should keep track of how much the user had spent on the option. If they had spent 20$ for 1 stock then spends 30$ later for 1 of the same stock it should be stored with a "count" of 2 and a "total price" of 50$.
* When they buy or sell a stock it is always based on the current price. The price which they purchase the stock does not necessarily matter except for marking how much they have spent, it should never come up again or be used for any further calculations. Thus is can be safely disregarded.
* When the user buys or sells a stock the request should be placed in a "mutation queue" which keeps track of the current mutation requests, which are just requests to make some kind of change to the database. These are listed with dates/times, type of mutation, user, option, and some other stuff.
	* In order to prevent users from purchasing options and then having the option price change before their request goes through, the option should only change after all requests have been completed. Possibly store the changed option somewhere sperated in the redis or wherever and then at the end of the loop the options in the full redis are updated before they are pushed up.
		* Theoretically there should be no changes to the database while the worker is running the logic for the mutations. The database should only change once at the end of the loop. This means that some requests could be changed asynconisly(?) but the price that a user buys should be set in stone right once they make the request, so that shouldnt really be an issue.
* When an option is bought or sold there should be some kind of change to the option's price. It should not be equal to the amount purchased (if it did that then the whole thing would explode every time some bought a bunch of options) instead there should be some kind of logic to adjust it slightly and with limits so that users can adjust the market slightly but arent able to destroy it.
## **Daily Change**
* Day to day stock information (possibly daily quarter, eg. 4 ticks per day)
* At determined intervals grab the current price of all options and add them to a seperate "daily change" table with FK to the options obv.
* The data should be displayed with the command "get options -a" which will show daily change for all options, and "get option [option name] -a" which will show the daily change for one option.
* The data for the daily change should be displayed as a candle chart, which means that the data that is saved when the data is captured will be different than how it is stored in the historical prices table.
	* https://observablehq.com/@d3/candlestick-chart/2
