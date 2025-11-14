        // Replace with your actual PG coordinates   
        const PG_LATITUDE = "32.700404";
        const PG_LONGITUDE = "74.873443";

        const toggleMapBtn = document.getElementById('toggleMapBtn');
        const toggleMapText = document.getElementById('toggleMapText');
        const mapContainer = document.getElementById('mapContainer');
        const mapFrame = document.getElementById('mapFrame');
        const directionsBtn = document.getElementById('directionsBtn');
        
        let isMapVisible = false;
        
        toggleMapBtn.addEventListener('click', function() {
            if (!isMapVisible) {
                mapContainer.classList.add('show');
                mapFrame.src = `https://www.google.com/maps?q=${PG_LATITUDE},${PG_LONGITUDE}&output=embed`;
                toggleMapText.textContent = 'Hide Map';
                isMapVisible = true;
                
                setTimeout(() => {
                    mapContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            } else {
                mapContainer.classList.remove('show');
                toggleMapText.textContent = 'Show Map';
                isMapVisible = false;
            }
        });
        
        directionsBtn.addEventListener('click', function() {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${PG_LATITUDE},${PG_LONGITUDE}`,
                '_blank'
            );
        });