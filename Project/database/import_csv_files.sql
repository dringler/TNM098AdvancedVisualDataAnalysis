#
# IMPORT CSV FILES INTO MYSQL DATABASE
#
# /Users/curtis/git/TNM098AdvancedVisualDataAnalysis/Project/park-movement-Fri.csv
#

# CONNECT TO DATABASE
# /Applications/MAMP/Library/bin/mysql -uInfoVis -pinfovis

# friday
LOAD DATA LOCAL INFILE '/Users/curtis/git/TNM098AdvancedVisualDataAnalysis/Project/park-movement-Fri.csv'
INTO TABLE avda.friday
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 LINES;

# saturday
LOAD DATA LOCAL INFILE '/Users/curtis/git/TNM098AdvancedVisualDataAnalysis/Project/park-movement-Sat.csv'
INTO TABLE avda.saturday
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 LINES;

# sunday
LOAD DATA LOCAL INFILE '/Users/curtis/git/TNM098AdvancedVisualDataAnalysis/Project/park-movement-Sun.csv'
INTO TABLE avda.sunday
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n'
IGNORE 1 LINES;