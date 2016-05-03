# http://stackoverflow.com/questions/1819124/image-comparison-algorithm

import time
import scipy as sp
from scipy.misc import imread
from scipy.signal.signaltools import correlate2d as c2d


start_time = time.time()

def get(i):
	# get JPG image as Scipy array, RGB (3 layer)
    data = imread('Lab3.1/%s.jpg' % i)
    # convert to grey-scale using W3C luminance calc
    data = sp.inner(data, [299, 587, 114]) / 1000.0
    print ('image {0} loaded'.format(i))
    # normalize per http://en.wikipedia.org/wiki/Cross-correlation
    return (data - data.mean()) / data.std()

#im1 = get('01')
#im2 = get('02')
#im3 = get('03')
# ...
im12 = get('12')

#im1.shape
#im2.shape
#im3.shape
#...

# geometry of the image
print ('im12.shape {0}'.format(im12.shape))
# number of pixels of the image
print ('im12.size {0} pixels'.format(im12.size))
# grey values scale
print ('im12.min,max {0}, {1}'.format(im12.min(),im12.max()))
# mean
print ('im12.mean {0}'.format(im12.mean()))

#c11 = c2d(im1, im1, mode='same')
#c12 = c2d(im1, im2, mode='same')
#c13 = c2d(im1, im3, mode='same')
#c23 = c2d(im2, im3, mode='same')
#c1212 = c2d(im12, im12, mode='same')
#c11.max(), c12.max(), c13.max(), c23.max()

#print (c1212.max())
print ('execution took {0} seconds'.format(time.time() - start_time))