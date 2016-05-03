# http://www.pyimagesearch.com/2014/03/03/charizard-explains-describe-quantify-image-using-feature-vectors/

import cv2

def readImg(i):
	image = cv2.imread('Lab3.1/%s.jpg' % i)
	return image

image12 = readImg('12')
print (image12.shape)