#!/bin/bash

# Create directories if they don't exist
mkdir -p public/images/station-logos

# Download placeholder images
curl -o public/images/radio-logo.png https://placehold.co/100x100/F6B17A/ffffff/png?text=Radio
curl -o public/images/default-album.png https://placehold.co/400x400/F6B17A/ffffff/png?text=Album
curl -o public/images/station-logos/jazz.png https://placehold.co/200x200/F6B17A/ffffff/png?text=Jazz
curl -o public/images/station-logos/classical.png https://placehold.co/200x200/F6B17A/ffffff/png?text=Classical
curl -o public/images/station-logos/rock.png https://placehold.co/200x200/F6B17A/ffffff/png?text=Rock 