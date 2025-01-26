import geocoder

# Get the current location using IP address
g = geocoder.ip('me')

# Print latitude and longitude
if g.ok:
    print("Latitude:", g.latlng[0])
    print("Longitude:", g.latlng[1])
else:
    print("Unable to determine location!")
