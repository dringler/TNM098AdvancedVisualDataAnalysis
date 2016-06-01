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
day = "sunday"
dayID = "daySundayID"
textfilename = "output/sunday_allIDs.txt"
IdSelectionID = "allID"

runs = 10
limitRuns = 4

# LIMIT
pLimit = 100

delay = 240 # seconds


try:
	text_file = open(textfilename, "a")
	text_file.write("Day: {0}\n".format(day))
	text_file.write("ID: {0}\n".format(IdSelectionID))
	text_file.write("\n")
	# enable browser logging
	d = DesiredCapabilities.CHROME
	d['loggingPrefs'] = { 'browser':'ALL' }
	browser = webdriver.Chrome(desired_capabilities=d)

	browser.get('http://localhost:8888/')	

	for r in xrange(limitRuns):
		print ("Start testing with limit = " + str(pLimit))

		dataRetrieved = []
		chartUpdated = []
		
		# select day
		browser.find_element_by_id(dayID).click();
		# select id
		browser.find_element_by_id(IdSelectionID).click()

		# enter limit
		elemLimit = browser.find_element_by_id('limitID') 
		elemLimit.clear()
		elemLimit.send_keys(pLimit)

		for x in xrange(runs):

			time.sleep(1)

			# press run botton
			browser.find_element_by_id('applyButtonID').click()
			# wait for chart to load
			WebDriverWait(browser, delay).until(EC.presence_of_element_located((By.ID, "canvasID")))

			time.sleep(1)

			print ("Run " + str(x) + " with limit " + str(pLimit) + " was successful")

			# print messages
			for entry in browser.get_log('browser'):
				msg = entry['message']
				if (msg.startswith("http://localhost:8888/js/main.js 126:18")):
					# data retrieved
					rawTimeData = msg[40:]
					dataRetrieved.append(rawTimeData)
				if (msg.startswith("http://localhost:8888/js/main.js 146:10")):
					# chart update
					rawTimeChart = msg[40:]
					chartUpdated.append(rawTimeChart)
		#print ("All runs were successful")
		print ("limit = " + str(pLimit))
		print ("Chart updated in: ")
		print(chartUpdated)
		print ("Data retrieved in:")
		print (dataRetrieved)
		# add array entries to text file
		text_file.write("Limit: {0}\n".format(pLimit))
		text_file.write("Chart updated\n")
		for item in chartUpdated:
			text_file.write("{0}\n".format(item))
		text_file.write("Data retrieved\n")
		for item in dataRetrieved:
			text_file.write("{0}\n".format(item))
		text_file.write("\n")

		pLimit = pLimit * 10
		browser.refresh()

	text_file.close()

except TimeoutException:
    print "Loading took too much time!"



browser.quit()