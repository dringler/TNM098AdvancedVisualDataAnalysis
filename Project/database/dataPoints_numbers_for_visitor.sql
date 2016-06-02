# GET AVERAGE, MIN and MAX value of data points for single visitor

SELECT AVG(count), MAX(count), MIN(count) FROM (
	SELECT COUNT(*) AS count FROM friday
	GROUP BY id
) AS counts

# AVERAGE: 1689.8830
# MAX: 3382
# MIN: 149

SELECT AVG(count), MAX(count), MIN(count) FROM (
	SELECT COUNT(*) AS count FROM saturday
	GROUP BY id
) AS counts

# AVERAGE: 1416.1009
# MAX: 2592
# MIN: 73

SELECT AVG(count), MAX(count), MIN(count) FROM (
	SELECT COUNT(*) AS count FROM sunday
	GROUP BY id
) AS counts

# AVERAGE: 1444.3683
# MAX: 2920
# MIN: 170