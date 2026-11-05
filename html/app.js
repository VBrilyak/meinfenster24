document.addEventListener('DOMContentLoaded', () => {
    fetch('/html/api.php')
        .then(res => res.json())
        .then(reviews => renderReviews(reviews))
        .catch(err => {
            console.error('Error loading reviews:', err);
        });
});

function renderReviews(reviews) {
    const container = document.getElementById('reviewsContainer');
    container.innerHTML = '';

    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--muted);">No reviews found.</p>';
        return;
    }

    reviews.forEach(r => {
        const card = document.createElement('article');
        card.className = 'card';

        const imageWrap = document.createElement('div');
        imageWrap.className = 'card-image';
        if (r.image) {
            const img = document.createElement('img');
            img.src = r.image;
            img.alt = 'Review image';
            img.onerror = () => {
                img.style.display = 'none';
                const ph = document.createElement('div');
                ph.className = 'placeholder';
                ph.textContent = 'Image not available';
                imageWrap.appendChild(ph);
            };
            imageWrap.appendChild(img);
        } else {
            const ph = document.createElement('div');
            ph.className = 'placeholder';
            ph.textContent = 'No image';
            imageWrap.appendChild(ph);
        }

        const content = document.createElement('div');
        content.className = 'card-content';

        const stars = renderStars(r.rating);
        content.appendChild(stars);

        const text = document.createElement('div');
        text.className = 'review-text';
        text.textContent = r.text;
        content.appendChild(text);

        const name = document.createElement('div');
        name.className = 'customer-name';
        name.textContent = formatName(r.name);
        content.appendChild(name);

        card.appendChild(imageWrap);
        card.appendChild(content);

        container.appendChild(card);
    });
}

function renderStars(rating) {
    const wrapper = document.createElement('div');
    wrapper.className = 'stars';
    const max = 5;
    const filled = Math.max(0, Math.min(max, Number(rating) || 0));

    for (let i = 1; i <= max; i++) {
        const s = document.createElement('span');
        s.className = 'star';
        s.innerHTML = '★';
        s.style.color = i <= filled ? '#f59e0b' : '#e5e7eb';
        wrapper.appendChild(s);
    }
    return wrapper;
}

function formatName(name) {
    if (!name) return '';
    const parts = String(name).trim().split(/\s+/);
    const first = parts[0] || '';
    const lastInitial = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return lastInitial ? `${first} ${lastInitial}.` : first;
}