# TODO

## **BUGS**
* Option description is set to longtext and works locally but will not work in prod.
	* Tried clearing the volume and resetting the database but it still wont work. Interestingly, the longtext works for blogs?

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
* Env -> Database
	* It would be a good idea to move as many env variables as we can (stuff that isnt secret) into the database so they can be changed on the fly without needing to restart the service

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
