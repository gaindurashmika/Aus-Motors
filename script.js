// Aus Motors Website - Advanced JavaScript Functionality
class AusMotorsWebsite {
    constructor() {
        this.vehicles = [];
        this.categories = [];
        this.makes = [];
        this.priceRanges = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
        this.setupMobileMenu();
        this.setupScrollEffects();
        this.setupFormHandling();
        this.setupCarousel();
        this.setupFinanceCalculator();
        this.setCurrentYear();
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Search form
        const searchForm = document.getElementById('searchForm');
        console.log('Search form element:', searchForm);
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                console.log('Search form submit event triggered');
                e.preventDefault();
                this.handleSearchForm(e.target);
            });
        }

        // Make filter change for model filter update
        const makeFilter = document.getElementById('makeFilter');
        if (makeFilter) {
            makeFilter.addEventListener('change', (e) => {
                this.updateModelFilter(e.target.value);
            });
        }

        // Filter form
        const filtersForm = document.getElementById('filters');
        if (filtersForm) {
            filtersForm.addEventListener('change', (e) => {
                this.handleFilterChange(e.target);
            });
        }

        // Finance form
        const financeForm = document.getElementById('financeForm');
        if (financeForm) {
            financeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calculateFinance(e.target);
            });
        }

        // Newsletter
        const newsletterForm = document.querySelector('.subscribe');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletterSubscription(e.target);
            });
        }
    }

    async loadData() {
        try {
            console.log('Loading data...');
            
            // Load vehicles
            const vehiclesResponse = await fetch('/api/cars');
            this.vehicles = await vehiclesResponse.json();
            console.log('Vehicles loaded:', this.vehicles.length);

            // Load categories
            const categoriesResponse = await fetch('/api/categories');
            this.categories = await categoriesResponse.json();
            console.log('Categories loaded:', this.categories);

            // Load makes
            const makesResponse = await fetch('/api/makes');
            this.makes = await makesResponse.json();
            console.log('Makes loaded:', this.makes);

            // Load price ranges
            const priceRangesResponse = await fetch('/api/price-ranges');
            this.priceRanges = await priceRangesResponse.json();
            console.log('Price ranges loaded:', this.priceRanges);

            this.populateSearchDropdowns();
            this.renderVehicles();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    populateSearchDropdowns() {
        console.log('Populating search dropdowns...');
        
        // Populate make filter
        const makeFilter = document.getElementById('makeFilter');
        console.log('Make filter element:', makeFilter);
        if (makeFilter && this.makes.length > 0) {
            console.log('Adding makes to filter:', this.makes);
            this.makes.forEach(make => {
                const option = document.createElement('option');
                option.value = make;
                option.textContent = make;
                makeFilter.appendChild(option);
            });
        }

        // Populate filter make
        const filterMake = document.getElementById('filterMake');
        console.log('Filter make element:', filterMake);
        if (filterMake && this.makes.length > 0) {
            this.makes.forEach(make => {
                const option = document.createElement('option');
                option.value = make;
                option.textContent = make;
                filterMake.appendChild(option);
            });
        }

        // Populate price filter
        const priceFilter = document.getElementById('priceFilter');
        console.log('Price filter element:', priceFilter);
        if (priceFilter && this.priceRanges) {
            // Create price range options based on min/max
            const ranges = [
                { value: '', label: 'All prices' },
                { value: '0-50000', label: '$0 - $50,000' },
                { value: '50000-100000', label: '$50,000 - $100,000' },
                { value: '100000+', label: '$100,000+' }
            ];
            
            ranges.forEach(range => {
                const option = document.createElement('option');
                option.value = range.value;
                option.textContent = range.label;
                priceFilter.appendChild(option);
            });
        }
    }

    updateModelFilter(selectedMake) {
        const modelFilter = document.getElementById('modelFilter');
        if (!modelFilter) return;

        // Clear existing options
        modelFilter.innerHTML = '<option value="">Any model</option>';

        if (selectedMake) {
            // Filter vehicles by make and get unique models
            const models = [...new Set(
                this.vehicles
                    .filter(vehicle => vehicle.make === selectedMake)
                    .map(vehicle => vehicle.model)
            )];

            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                modelFilter.appendChild(option);
            });
        }
    }

    handleSearchForm(form) {
        console.log('Search form submitted');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        console.log('Search form data:', data);
        
        // Update model filter based on selected make
        if (data.make) {
            this.updateModelFilter(data.make);
        }

        // Filter vehicles based on search criteria
        this.filterVehicles(data);
    }

    handleFilterChange(target) {
        const formData = new FormData(target.form);
        const data = Object.fromEntries(formData.entries());
        this.filterVehicles(data);
    }

    filterVehicles(filters) {
        console.log('Filtering vehicles with:', filters);
        let filteredVehicles = [...this.vehicles];
        console.log('Total vehicles before filtering:', filteredVehicles.length);

        // Apply condition filter
        if (filters.condition && filters.condition !== '') {
            filteredVehicles = filteredVehicles.filter(v => v.status === filters.condition);
            console.log('After condition filter:', filteredVehicles.length);
        }

        // Apply make filter
        if (filters.make && filters.make !== '') {
            filteredVehicles = filteredVehicles.filter(v => v.make === filters.make);
            console.log('After make filter:', filteredVehicles.length);
        }

        // Apply transmission filter
        if (filters.transmission && filters.transmission !== '') {
            filteredVehicles = filteredVehicles.filter(v => v.transmission === filters.transmission);
            console.log('After transmission filter:', filteredVehicles.length);
        }

        // Apply sorting
        if (filters.sort) {
            switch (filters.sort) {
                case 'price-asc':
                    filteredVehicles.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                    break;
                case 'price-desc':
                    filteredVehicles.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
                    break;
                case 'recent':
                default:
                    filteredVehicles.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    break;
            }
        }

        console.log('Final filtered vehicles:', filteredVehicles.length);
        this.renderFilteredVehicles(filteredVehicles);
    }

    renderVehicles() {
        console.log('Rendering vehicles...');
        this.renderFilteredVehicles(this.vehicles);
    }

    renderFilteredVehicles(vehicles) {
        const vehiclesContainer = document.getElementById('vehiclesContainer');
        if (!vehiclesContainer) return;

        vehiclesContainer.innerHTML = vehicles.map(vehicle => `
            <article class="card">
                <img src="${vehicle.image_url || 'https://images.unsplash.com/photo-1493238850501-854fdb5b1c4b?q=80&w=1200&auto=format&fit=crop'}" alt="${vehicle.name}" />
                <div class="card__body">
                    <h3 class="card__title">${vehicle.name}</h3>
                    <p class="card__meta">${vehicle.year} • ${vehicle.mileage} km • ${vehicle.transmission} • ${vehicle.fuel_type}</p>
                    <div class="card__footer">
                        <span class="price">$${vehicle.price.toLocaleString()}</span>
                        <a class="btn btn--ghost" href="#" onclick="ausMotors.openVehicleDetails(${vehicle.id})">View details</a>
                    </div>
                </div>
            </article>
        `).join('');

        // Update carousel navigation state
        this.updateCarouselNav();
    }

    setupCarousel() {
        const track = document.querySelector('[data-track]');
        const prevBtn = document.querySelector('[data-prev]');
        const nextBtn = document.querySelector('[data-next]');
        
        if (!track || !prevBtn || !nextBtn) return;

        let currentIndex = 0;
        const cardWidth = 300; // Approximate card width + gap
        const visibleCards = Math.floor(track.offsetWidth / cardWidth);
        const maxIndex = Math.max(0, this.vehicles.length - visibleCards);

        const updateNav = () => {
            prevBtn.classList.toggle('is-disabled', currentIndex === 0);
            nextBtn.classList.toggle('is-disabled', currentIndex >= maxIndex);
        };

        const slideTo = (index) => {
            currentIndex = Math.max(0, Math.min(index, maxIndex));
            track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
            updateNav();
        };

        prevBtn.addEventListener('click', () => slideTo(currentIndex - 1));
        nextBtn.addEventListener('click', () => slideTo(currentIndex + 1));

        // Initialize navigation state
        updateNav();
    }

    updateCarouselNav() {
        // This will be called after rendering vehicles to update navigation state
        setTimeout(() => {
            this.setupCarousel();
        }, 100);
    }

    setupFinanceCalculator() {
        const financeForm = document.getElementById('financeForm');
        if (!financeForm) return;

        financeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateFinance(e.target);
        });
    }

    calculateFinance(form) {
        const formData = new FormData(form);
        const price = parseFloat(formData.get('price')) || 0;
        const down = parseFloat(formData.get('down')) || 0;
        const rate = parseFloat(formData.get('rate')) || 0;
        const term = parseInt(formData.get('term')) || 0;

        if (price <= 0 || rate <= 0 || term <= 0) {
            this.showFinanceResult('Please enter valid values for all required fields.', 'error');
            return;
        }

        const principal = price - down;
        const monthlyRate = rate / 100 / 12;
        const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
        const totalPayment = monthlyPayment * term;
        const totalInterest = totalPayment - principal;

        const result = `
            <strong>Monthly Payment:</strong> $${monthlyPayment.toFixed(2)}<br>
            <strong>Total Interest:</strong> $${totalInterest.toFixed(2)}<br>
            <strong>Total Payment:</strong> $${totalPayment.toFixed(2)}
        `;

        this.showFinanceResult(result, 'success');
    }

    showFinanceResult(message, type) {
        const resultDiv = document.getElementById('financeResult');
        if (resultDiv) {
            resultDiv.innerHTML = message;
            resultDiv.className = `finance__result finance__result--${type}`;
        }
    }

    openVehicleDetails(vehicleId) {
        const vehicle = this.vehicles.find(v => v.id === vehicleId);
        if (!vehicle) return;

        // For now, just show a simple alert. You can expand this to show a modal
        alert(`${vehicle.name}\nPrice: $${vehicle.price.toLocaleString()}\nYear: ${vehicle.year}\nMileage: ${vehicle.mileage} km\nFuel: ${vehicle.fuel_type}\nTransmission: ${vehicle.transmission}`);
    }

    handleNewsletterSubscription(form) {
        const email = form.querySelector('input[type="email"]').value;
        if (email) {
            this.showNotification('Thank you for subscribing!', 'success');
            form.reset();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    setupMobileMenu() {
        const navToggle = document.getElementById('navToggle');
        const nav = document.getElementById('primaryNav');
        
        if (navToggle && nav) {
            navToggle.addEventListener('click', () => {
                nav.classList.toggle('open');
            });
        }
    }

    setupScrollEffects() {
        let lastScrollTop = 0;
        const header = document.querySelector('.site-header');
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
            } else {
                header.style.background = '#fff';
            }
            
            lastScrollTop = scrollTop;
        });
    }

    setupFormHandling() {
        // Add any additional form handling logic here
    }

    setCurrentYear() {
        const yearSpan = document.getElementById('year');
        if (yearSpan) {
            yearSpan.textContent = new Date().getFullYear();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Aus Motors website...');
    alert('JavaScript is running! Check console for debugging info.');
    window.ausMotors = new AusMotorsWebsite();
    
    // Add additional CSS for notifications
    const additionalStyles = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 1rem;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
            z-index: 4000;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        }
        
        .notification-success { border-left: 4px solid #10b981; }
        .notification-error { border-left: 4px solid #ef4444; }
        .notification-warning { border-left: 4px solid #f59e0b; }
        .notification-info { border-left: 4px solid #1e3a8a; }
        
        .notification-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .notification-content button {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #6b7280;
            margin-left: 1rem;
        }
        
        .finance__result--success { color: #10b981; }
        .finance__result--error { color: #ef4444; }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = additionalStyles;
    document.head.appendChild(styleSheet);
});
