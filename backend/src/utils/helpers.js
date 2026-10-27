const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const slugify = (text) =>
    String(text)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'store';

const round2 = (n) => Math.round(n * 100) / 100;

const VAT_RATE = 0.15; // South African VAT

const DAY = 24 * 60 * 60 * 1000;
const SUBSCRIPTION_DAYS = 30;

module.exports = { escapeRegex, slugify, round2, VAT_RATE, DAY, SUBSCRIPTION_DAYS };
