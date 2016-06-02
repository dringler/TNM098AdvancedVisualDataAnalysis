# SELENIUM TESTING
from selenium import webdriver
#CHROME
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities    
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException

import time
import os

# PARAMETER
textfilename = "output/initialView.txt"
runs = 10

delay = 240 # seconds


try:
	text_file = open(textfilename, "a")
	text_file.write("Initial view\n")
	text_file.write("\n")
	# enable browser logging
	d = DesiredCapabilities.CHROME
	d['loggingPrefs'] = { 'browser':'ALL' }
	browser = webdriver.Chrome(desired_capabilities=d)

	browser.get('http://localhost:8888/')	


	print ("Start testing")

	dataRetrieved = []
	chartUpdated = []
		
	
	for x in xrange(runs):

		time.sleep(1)

		# wait for chart to load
		WebDriverWait(browser, delay).until(EC.presence_of_element_located((By.ID, "canvasID")))

		time.sleep(1)

		print ("Run " + str(x) + " was successful")

		# print messages
		for entry in browser.get_log('browser'):
			msg = entry['message']
			if (msg.startswith("http://localhost:8888/js/main.js 36:15")):
				# data retrieved
				rawTimeData = msg[39:]
				dataRetrieved.append(rawTimeData)
			if (msg.startswith("http://localhost:8888/js/main.js 57:11")):
				# chart updated
				rawTimeData = msg[39:]
				chartUpdated.append(rawTimeData)

		# refresh the page
		browser.refresh()

	print ("All runs were successful")

	print ("Chart updated in: ")
	print(chartUpdated)
	print ("Data retrieved in:")
	print (dataRetrieved)
	# add array entries to text file
	text_file.write("Chart updated\n")
	for item in chartUpdated:
		text_file.write("{0}\n".format(item))
	text_file.write("\n")
	text_file.write("Data retrieved\n")
	for item in dataRetrieved:
		text_file.write("{0}\n".format(item))
	text_file.write("\n")
		

	text_file.close()

except TimeoutException:
    print "Loading took too much time!"



browser.quit()