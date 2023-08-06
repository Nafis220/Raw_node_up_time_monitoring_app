# Raw_node_up_time_monitoring_app
In order to create a adequate knowledge of node.js we need to provide attention to this technology. Having this idea in mind a application is created where node.js was the sole technology that was in force to build the entire 
applicaiton. 


This app is developed with core concepts of node.js such as file system module, http, https modules and so on. It is not dependent in any of third party library not even express.js since it is developed over raw node. It has 
three files of crude operation that handles user's info, token, and checks. This app can create , update and delete users. It verify the users using the token and enables the users to create checks. Users can provide
url and other necessary information within a check.This app monitor the sites given by the user with a particular period of interval  and the when website became down it make it up automatically as well as send a message to 
the user's mobile number. To send message it uses Twilio's api. It is the only library that has been user in this app. 

However, creating this app without using a third party library was quite time consuming and tough though I did it after a lot of hard work. 
