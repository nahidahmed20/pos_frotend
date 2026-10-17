'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';

export default function PosPage() {
    // Master data
    const [catalog, setCatalog] = useState([]);
    const [categories, setCategories] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [user, setUser] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [appInfo, setAppInfo] = useState(null);

    // Search, Filter & Clock
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentTime, setCurrentTime] = useState('');
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Navigation & Dropdown
    const [openDropdown, setOpenDropdown] = useState(null);
    const searchInputRef = useRef(null);

    // Cart & Order Calculation
    const [cart, setCart] = useState([]);
    const [customerId, setCustomerId] = useState('');
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState('fixed'); // 'fixed' | 'percent'
    const [tax, setTax] = useState(0);
    const [taxType, setTaxType] = useState('fixed'); // 'fixed' | 'percent'
    const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'card' | 'mobile_banking' | 'due'
    const [cashReceived, setCashReceived] = useState('');
    const [orderNumber, setOrderNumber] = useState('ORD-1001');

    // Modals & Popups
    const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '' });
    const [showVariantModal, setShowVariantModal] = useState(null); // holds product object
    const [heldOrders, setHeldOrders] = useState([]);
    const [showHeldModal, setShowHeldModal] = useState(false);
    const [completedSale, setCompletedSale] = useState(null);
    const [showCouponModal, setShowCouponModal] = useState(false);
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    // POS Calculator
    const [showCalculator, setShowCalculator] = useState(false);
    const [calcDisplay, setCalcDisplay] = useState('0');
    const [calcEquation, setCalcEquation] = useState('');
    const [calcResetOnNext, setCalcResetOnNext] = useState(false);

    // Audio synthesizer for instant tactile POS feedback
    const playSound = (type = 'beep') => {
        if (!soundEnabled || typeof window === 'undefined') return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();

            if (type === 'beep') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.08);
            } else if (type === 'success') {
                [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
                    gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.07);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.15);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(ctx.currentTime + idx * 0.07);
                    osc.stop(ctx.currentTime + idx * 0.07 + 0.16);
                });
            } else if (type === 'warning') {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(300, ctx.currentTime);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.18);
            }
        } catch {
            // Audio context silently handled if blocked by browser policy
        }
    };

    const toast = (icon, title) => {
        if (typeof window !== 'undefined' && window.Swal) {
            window.Swal.fire({
                toast: true,
                position: 'top-end',
                icon,
                title,
                showConfirmButton: false,
                timer: 5000,
                timerProgressBar: true,
            });
        }
    };

    // Initialize clock, load saved held orders, and keyboard shortcuts
    useEffect(() => {
        setMounted(true);
        setOrderNumber(`ORD-${Math.floor(1000 + Math.random() * 9000)}`);

        // Load held orders from storage
        try {
            const savedHeld = window.localStorage.getItem('pos_held_orders');
            if (savedHeld) {
                setHeldOrders(JSON.parse(savedHeld));
            }
        } catch {}

        // Clock timer
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);

        // Global POS Keyboard Shortcuts
        const handleKeyDown = (e) => {
            if (e.key === 'F1' || (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
                e.preventDefault();
                searchInputRef.current?.focus();
            } else if (e.key === 'F2') {
                e.preventDefault();
                setShowNewCustomerModal(true);
            } else if (e.key === 'F3') {
                e.preventDefault();
                setShowCalculator((prev) => !prev);
            } else if (e.key === 'F4') {
                e.preventDefault();
                document.getElementById('btn-place-order')?.click();
            } else if (e.key === 'F8') {
                e.preventDefault();
                document.getElementById('btn-hold-order')?.click();
            } else if (e.key === 'Escape') {
                setShowVariantModal(null);
                setShowNewCustomerModal(false);
                setShowHeldModal(false);
                setShowCouponModal(false);
                setShowCalculator(false);
                setCompletedSale(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            clearInterval(interval);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Load POS data scoped to selected branch
    const loadData = async (branchIdOverride) => {
        setLoading(true);
        try {
            const [catRes, meRes, branchRes, infoRes] = await Promise.all([
                axios.get('/api/categories').catch(() => ({ data: { data: [] } })),
                axios.get('/api/me').catch(() => axios.get('/api/profile')).catch(() => ({ data: null })),
                axios.get('/api/branches').catch(() => ({ data: { data: [] } })),
                axios.get('/api/app-info').catch(() => ({ data: null })),
            ]);

            setCategories(Array.isArray(catRes?.data?.data) ? catRes.data.data : []);
            setAppInfo(infoRes?.data || null);

            const userData = meRes?.data?.user || meRes?.data?.data || meRes?.data || null;
            setUser(userData);

            const branchList = Array.isArray(branchRes?.data?.data) ? branchRes.data.data : [];
            setBranches(branchList);

            const activeBranch = branchIdOverride
                ? branchList.find((b) => b.id === branchIdOverride)
                : (userData?.branch || (userData?.branch_id ? branchList.find((b) => b.id === userData.branch_id) : branchList[0]) || null);
            setSelectedBranch(activeBranch);

            const branchId = activeBranch?.id;
            const params = branchId ? { branch_id: branchId } : {};

            // Load branch-scoped customers
            const custRes = await axios.get('/api/customers', { params }).catch(() => ({ data: { data: [] } }));
            setCustomers(Array.isArray(custRes?.data?.data) ? custRes.data.data : []);

            // Load branch-scoped catalog with variants & real-time stock
            const prodRes = await axios.get('/api/pos/catalog', { params })
                .catch(() => axios.get('/api/products', { params }))
                .catch(() => ({ data: { data: [] } }));

            const prods = prodRes?.data?.data?.data || prodRes?.data?.data || prodRes?.data || [];
            setCatalog(Array.isArray(prods) ? prods : []);
        } catch {
            setCatalog([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filter products
    const filteredCatalog = useMemo(() => {
        let prods = catalog;
        if (selectedCategory !== 'all') {
            prods = prods.filter((p) => String(p.category_id) === String(selectedCategory));
        }
        if (searchTerm.trim()) {
            const q = searchTerm.toLowerCase();
            prods = prods.filter(
                (p) =>
                    p.name?.toLowerCase().includes(q) ||
                    p.sku?.toLowerCase().includes(q) ||
                    p.barcode?.toLowerCase().includes(q) ||
                    p.variants?.some((v) => v.name?.toLowerCase().includes(q) || v.sku?.toLowerCase().includes(q) || v.barcode?.includes(q))
            );
        }
        return prods;
    }, [catalog, selectedCategory, searchTerm]);

    // Cart calculations
    const subtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0);
    }, [cart]);

    const discountAmount = useMemo(() => {
        let computed = 0;
        const val = Number(discount || 0);
        if (discountType === 'percent') {
            computed = (subtotal * val) / 100;
        } else {
            computed = val;
        }

        if (appliedCoupon) {
            if (appliedCoupon.discount_type === 'percent') {
                computed += (subtotal * Number(appliedCoupon.discount_value)) / 100;
            } else {
                computed += Number(appliedCoupon.discount_value);
            }
        }
        return Math.min(computed, subtotal);
    }, [subtotal, discount, discountType, appliedCoupon]);

    const taxAmount = useMemo(() => {
        const val = Number(tax || 0);
        if (taxType === 'percent') {
            return (subtotal * val) / 100;
        }
        return val;
    }, [subtotal, tax, taxType]);

    const grandTotal = useMemo(() => {
        const total = subtotal - discountAmount + taxAmount;
        return total > 0 ? Number(total.toFixed(2)) : 0;
    }, [subtotal, discountAmount, taxAmount]);

    // Keep cashReceived in sync with grandTotal when not modified by user
    useEffect(() => {
        if (paymentMethod === 'cash') {
            setCashReceived(String(grandTotal));
        } else if (paymentMethod === 'due') {
            setCashReceived('0');
        } else {
            setCashReceived(String(grandTotal));
        }
    }, [grandTotal, paymentMethod]);

    const changeAmount = useMemo(() => {
        if (paymentMethod !== 'cash') return 0;
        const rec = Number(cashReceived || 0);
        return rec >= grandTotal ? Number((rec - grandTotal).toFixed(2)) : 0;
    }, [cashReceived, grandTotal, paymentMethod]);

    const dueAmount = useMemo(() => {
        if (paymentMethod === 'due') return grandTotal;
        if (paymentMethod === 'cash') {
            const rec = Number(cashReceived || 0);
            return rec < grandTotal ? Number((grandTotal - rec).toFixed(2)) : 0;
        }
        return 0;
    }, [cashReceived, grandTotal, paymentMethod]);

    // Add item to cart with variant & stock tracking
    const addToCart = (product, variant = null) => {
        const hasVariants = product.variants && product.variants.length > 0;

        // If product has variants and no variant was explicitly chosen, open variant selector modal
        if (hasVariants && !variant) {
            setShowVariantModal(product);
            playSound('beep');
            return;
        }

        const price = variant
            ? Number(variant.selling_price || variant.retail_price || product.selling_price || product.retail_price || 0)
            : Number(product.selling_price || product.retail_price || 0);

        const availableStock = variant
            ? (variant.sellable_quantity ?? variant.stock?.quantity ?? 999)
            : (product.sellable_quantity ?? product.stock?.quantity ?? 999);

        if (availableStock <= 0) {
            playSound('warning');
            toast('error', `${product.name} ${variant ? `(${variant.name})` : ''} is out of stock!`);
            return;
        }

        const itemKey = variant ? `${product.id}-${variant.id}` : String(product.id);

        setCart((prev) => {
            const existing = prev.find((item) => item.key === itemKey);
            if (existing) {
                if (existing.quantity >= availableStock) {
                    playSound('warning');
                    toast('warning', `Maximum available stock reached (${availableStock} pcs).`);
                    return prev;
                }
                playSound('beep');
                return prev.map((item) =>
                    item.key === itemKey ? { ...item, quantity: item.quantity + 1 } : item
                );
            }

            playSound('beep');
            return [
                ...prev,
                {
                    key: itemKey,
                    product_id: product.id,
                    variant_id: variant ? variant.id : null,
                    name: product.name,
                    variant_name: variant ? variant.name : null,
                    sku: variant ? variant.sku : product.sku,
                    price,
                    quantity: 1,
                    max_stock: availableStock,
                    category: product.category?.name || 'General',
                    image: product.image_path || '/assets/img/products/pos-product-01.png',
                },
            ];
        });

        if (showVariantModal) {
            setShowVariantModal(null);
        }
    };

    // Update quantity with stock ceiling
    const updateQuantity = (key, delta) => {
        setCart((prev) =>
            prev
                .map((item) => {
                    if (item.key === key) {
                        const newQty = item.quantity + delta;
                        if (newQty <= 0) return null;
                        if (delta > 0 && newQty > item.max_stock) {
                            playSound('warning');
                            toast('warning', `Maximum stock limit reached (${item.max_stock} pcs).`);
                            return item;
                        }
                        playSound('beep');
                        return { ...item, quantity: newQty };
                    }
                    return item;
                })
                .filter(Boolean)
        );
    };

    const removeFromCart = (key) => {
        playSound('beep');
        setCart((prev) => prev.filter((item) => item.key !== key));
    };

    const clearCart = () => {
        playSound('beep');
        setCart([]);
        setDiscount(0);
        setTax(0);
        setAppliedCoupon(null);
        setCustomerId('');
        setOrderNumber(`ORD-${Math.floor(1000 + Math.random() * 9000)}`);
    };

    // Barcode Scanner / Instant Search Auto-Add Handler
    const handleBarcodeSearch = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const term = searchTerm.trim().toLowerCase();
            if (!term) return;

            // Search by exact barcode or SKU first, then by name
            const exactProduct = catalog.find((p) =>
                p.barcode?.toLowerCase() === term ||
                p.sku?.toLowerCase() === term ||
                p.variants?.some((v) => v.barcode?.toLowerCase() === term || v.sku?.toLowerCase() === term)
            );

            if (exactProduct) {
                // If variant barcode was matched directly
                const matchedVariant = exactProduct.variants?.find(
                    (v) => v.barcode?.toLowerCase() === term || v.sku?.toLowerCase() === term
                );
                addToCart(exactProduct, matchedVariant || null);
                setSearchTerm('');
                toast('success', `Scanned: ${exactProduct.name}`);
                return;
            }

            // Fallback: single filtered result
            if (filteredCatalog.length === 1) {
                addToCart(filteredCatalog[0]);
                setSearchTerm('');
                toast('success', `Added: ${filteredCatalog[0].name}`);
                return;
            }

            if (filteredCatalog.length === 0) {
                playSound('warning');
                toast('warning', 'No product found with this barcode/SKU.');
            }
        }
    };

    // Hold Orders (Park / Recall Sale)
    const handleHoldOrder = () => {
        if (cart.length === 0) {
            toast('warning', 'Please add products to hold the order.');
            return;
        }

        const newHeld = {
            id: Date.now(),
            orderNumber,
            cart: [...cart],
            customerId,
            discount,
            discountType,
            tax,
            taxType,
            appliedCoupon,
            grandTotal,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            branch_id: selectedBranch?.id,
        };

        const updatedHeld = [newHeld, ...heldOrders];
        setHeldOrders(updatedHeld);
        try {
            window.localStorage.setItem('pos_held_orders', JSON.stringify(updatedHeld));
        } catch {}

        playSound('success');
        toast('info', `Order ${orderNumber} placed on hold.`);
        clearCart();
    };

    const handleRecallOrder = (heldItem) => {
        setCart(heldItem.cart || []);
        setCustomerId(heldItem.customerId || '');
        setDiscount(heldItem.discount || 0);
        setDiscountType(heldItem.discountType || 'fixed');
        setTax(heldItem.tax || 0);
        setTaxType(heldItem.taxType || 'fixed');
        setAppliedCoupon(heldItem.appliedCoupon || null);
        setOrderNumber(heldItem.orderNumber);

        const remaining = heldOrders.filter((h) => h.id !== heldItem.id);
        setHeldOrders(remaining);
        try {
            window.localStorage.setItem('pos_held_orders', JSON.stringify(remaining));
        } catch {}

        setShowHeldModal(false);
        playSound('beep');
        toast('success', `Recalled Order #${heldItem.orderNumber}`);
    };

    const handleDeleteHeld = (id) => {
        const remaining = heldOrders.filter((h) => h.id !== id);
        setHeldOrders(remaining);
        try {
            window.localStorage.setItem('pos_held_orders', JSON.stringify(remaining));
        } catch {}
        toast('info', 'Held order deleted.');
    };

    // Apply Coupon Code
    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        const code = couponInput.trim();
        if (!code) return;

        try {
            const res = await axios.get('/api/coupons').catch(() => ({ data: { data: [] } }));
            const coupons = Array.isArray(res.data?.data) ? res.data.data : [];
            const found = coupons.find((c) => c.code.toLowerCase() === code.toLowerCase() && c.is_active);

            if (found) {
                setAppliedCoupon(found);
                setShowCouponModal(false);
                setCouponInput('');
                playSound('success');
                toast('success', `Coupon '${found.code}' applied!`);
            } else {
                playSound('warning');
                toast('error', 'Invalid or expired coupon code.');
            }
        } catch {
            playSound('warning');
            toast('error', 'Could not verify coupon.');
        }
    };

    // Quick add customer scoped to active branch
    const handleCreateCustomer = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/customers', {
                name: newCustomer.name,
                phone: newCustomer.phone || null,
                email: newCustomer.email || null,
                branch_id: selectedBranch?.id || null,
            });
            const created = res.data?.data || res.data;
            setCustomers((prev) => [created, ...prev]);
            setCustomerId(String(created.id));
            setShowNewCustomerModal(false);
            setNewCustomer({ name: '', phone: '', email: '' });
            playSound('success');
            toast('success', 'Customer added successfully!');
        } catch (err) {
            playSound('warning');
            toast('error', err.response?.data?.message || 'Could not add customer.');
        }
    };

    // Checkout submission
    const handleCheckout = async () => {
        if (cart.length === 0) {
            playSound('warning');
            toast('warning', 'Please add products to the order list.');
            return;
        }

        if (!selectedBranch?.id) {
            toast('warning', 'Please select a branch first.');
            return;
        }

        setSubmitting(true);
        const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

        try {
            const calculatedDiscount = Number(discountAmount.toFixed(2));
            const calculatedTax = Number(taxAmount.toFixed(2));
            const finalPaid = paymentMethod === 'due' ? 0 : Math.min(grandTotal, Number(cashReceived || grandTotal));

            const payload = {
                invoice_number: invoiceNumber,
                customer_id: customerId ? Number(customerId) : null,
                items: cart.map((i) => ({
                    product_id: i.product_id,
                    ...(i.variant_id ? { variant_id: i.variant_id } : {}),
                    quantity: i.quantity,
                })),
                discount: calculatedDiscount,
                tax: calculatedTax,
                paid_amount: finalPaid,
                payment_method: paymentMethod,
                branch_id: selectedBranch.id,
            };

            const res = await axios.post('/api/sales', payload);
            playSound('success');
            toast('success', `Order ${invoiceNumber} placed successfully!`);

            const customerObj = customers.find((c) => String(c.id) === String(customerId));

            setCompletedSale({
                invoice_number: invoiceNumber,
                date: new Date().toLocaleString(),
                customer: customerObj ? customerObj.name : 'Walk in Customer',
                customer_phone: customerObj?.phone || '—',
                items: [...cart],
                subtotal,
                discount: calculatedDiscount,
                discountType,
                discountRate: discount,
                tax: calculatedTax,
                taxType,
                taxRate: tax,
                grandTotal,
                paid_amount: finalPaid,
                change_amount: changeAmount,
                due_amount: dueAmount,
                paymentMethod,
                cashier: user?.name || 'Cashier',
                branchName: selectedBranch?.name || 'Main Branch',
                saleId: res.data?.data?.id,
            });

            clearCart();
            // Refresh catalog stocks in background
            loadData(selectedBranch.id);
        } catch (err) {
            playSound('warning');
            const msg = err.response?.data?.message || (err.response?.data?.errors ? Object.values(err.response.data.errors)[0] : 'Failed to place order.');
            toast('error', String(msg));
        } finally {
            setSubmitting(false);
        }
    };

    // Calculator Evaluation & Key Handlers
    const safeCalcEval = (expr) => {
        try {
            const sanitized = expr.replace(/×/g, '*').replace(/÷/g, '/');
            if (!/^[0-9+\-*/. ]+$/.test(sanitized)) return 0;
            // eslint-disable-next-line no-new-func
            const res = Function(`"use strict"; return (${sanitized})`)();
            if (isNaN(res) || !isFinite(res)) return 0;
            return Number(Number(res).toFixed(4));
        } catch {
            return 0;
        }
    };

    const handleCalcDigit = (digit) => {
        playSound('beep');
        if (calcResetOnNext || calcDisplay === '0') {
            setCalcDisplay(String(digit));
            setCalcResetOnNext(false);
        } else {
            if (calcDisplay.length < 15) {
                setCalcDisplay(calcDisplay + digit);
            }
        }
    };

    const handleCalcDecimal = () => {
        playSound('beep');
        if (calcResetOnNext) {
            setCalcDisplay('0.');
            setCalcResetOnNext(false);
            return;
        }
        if (!calcDisplay.includes('.')) {
            setCalcDisplay(calcDisplay + '.');
        }
    };

    const handleCalcOperator = (op) => {
        playSound('beep');
        if (calcResetOnNext && calcEquation) {
            setCalcEquation(calcEquation.trim().replace(/[+\-×÷*/]$/, op) + ' ');
            return;
        }
        if (calcEquation) {
            const fullExpr = calcEquation + calcDisplay;
            const res = safeCalcEval(fullExpr);
            setCalcEquation(res + ' ' + op + ' ');
            setCalcDisplay(String(res));
        } else {
            setCalcEquation(calcDisplay + ' ' + op + ' ');
        }
        setCalcResetOnNext(true);
    };

    const handleCalcEquals = () => {
        playSound('beep');
        if (!calcEquation) return;
        const fullExpr = calcEquation + calcDisplay;
        const res = safeCalcEval(fullExpr);
        setCalcEquation(`${calcEquation} ${calcDisplay} =`);
        setCalcDisplay(String(res));
        setCalcResetOnNext(true);
    };

    const handleCalcClear = () => {
        playSound('beep');
        setCalcDisplay('0');
        setCalcEquation('');
        setCalcResetOnNext(false);
    };

    const handleCalcBackspace = () => {
        playSound('beep');
        if (calcResetOnNext) {
            setCalcDisplay('0');
            setCalcResetOnNext(false);
            return;
        }
        if (calcDisplay.length > 1) {
            setCalcDisplay(calcDisplay.slice(0, -1));
        } else {
            setCalcDisplay('0');
        }
    };

    const handleCalcToggleSign = () => {
        playSound('beep');
        if (calcDisplay === '0') return;
        if (calcDisplay.startsWith('-')) {
            setCalcDisplay(calcDisplay.slice(1));
        } else {
            setCalcDisplay('-' + calcDisplay);
        }
    };

    const handleCalcPercent = () => {
        playSound('beep');
        const val = Number(calcDisplay);
        if (!isNaN(val)) {
            setCalcDisplay(String(Number((val / 100).toFixed(4))));
        }
    };

    const handleApplyCalcToCash = () => {
        playSound('success');
        const val = Number(calcDisplay);
        if (!isNaN(val) && val >= 0) {
            setPaymentMethod('cash');
            setCashReceived(String(val));
            setShowCalculator(false);
            toast('success', `Cash Received set to ৳${val}`);
        }
    };

    const handleLoadGrandTotal = () => {
        playSound('beep');
        setCalcDisplay(String(grandTotal));
        setCalcEquation('');
        setCalcResetOnNext(true);
    };

    const handleQuickAdd = (amt) => {
        playSound('beep');
        const curr = Number(calcDisplay) || 0;
        setCalcDisplay(String(curr + amt));
        setCalcResetOnNext(false);
    };

    const handleCopyCalc = () => {
        playSound('beep');
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(calcDisplay);
            toast('success', `Copied ৳${calcDisplay} to clipboard`);
        }
    };

    // Keyboard numpad listener when calculator modal is active
    useEffect(() => {
        if (!showCalculator) return;
        const handleCalcKeyDown = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (/^[0-9]$/.test(e.key)) {
                e.preventDefault();
                handleCalcDigit(e.key);
            } else if (e.key === '.') {
                e.preventDefault();
                handleCalcDecimal();
            } else if (e.key === '+' || e.key === '-') {
                e.preventDefault();
                handleCalcOperator(e.key);
            } else if (e.key === '*') {
                e.preventDefault();
                handleCalcOperator('×');
            } else if (e.key === '/') {
                e.preventDefault();
                handleCalcOperator('÷');
            } else if (e.key === 'Enter' || e.key === '=') {
                e.preventDefault();
                handleCalcEquals();
            } else if (e.key === 'Backspace') {
                e.preventDefault();
                handleCalcBackspace();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setShowCalculator(false);
            } else if (e.key.toLowerCase() === 'c') {
                e.preventDefault();
                handleCalcClear();
            }
        };

        window.addEventListener('keydown', handleCalcKeyDown);
        return () => window.removeEventListener('keydown', handleCalcKeyDown);
    }, [showCalculator, calcDisplay, calcEquation, calcResetOnNext]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            }
        }
    };

    return (
        <div className="main-wrapper pos-five bg-slate-50 min-h-screen">
            {/* Header POS */}
            <div className="header pos-header border-b bg-white shadow-sm sticky top-0 z-40">
                <div className="main-header flex items-center justify-between px-4 py-2.5">
                    {/* Brand / Logo */}
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <img src={appInfo?.logo_dark || '/assets/img/logo.svg'} alt="Logo" className="h-8 object-contain" />
                            <span className="text-xs font-black px-2 py-0.5 bg-primary/10 text-primary rounded-full uppercase tracking-wider hidden sm:inline-block">
                                POS Terminal
                            </span>
                        </Link>
                    </div>

                    {/* Header Controls */}
                    <ul className="nav user-menu flex items-center gap-2 m-0 p-0">
                        {/* Live Timer */}
                        <li className="nav-item hidden md:block">
                            <span suppressHydrationWarning className="bg-teal-600 text-white inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm">
                                <i className="ti ti-clock me-1.5 text-sm" />
                                {mounted ? (currentTime || '00:00:00') : '00:00:00'}
                            </span>
                        </li>

                        {/* Back to Dashboard */}
                        <li className="nav-item">
                            <Link href="/dashboard" className="btn bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg inline-flex items-center gap-1 shadow-sm transition-all">
                                <i className="ti ti-layout-dashboard" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Link>
                        </li>

                        {/* Select Store / Branch */}
                        <li className="nav-item relative">
                            <button
                                type="button"
                                className="px-3 py-1.5 border border-slate-200 hover:border-primary rounded-lg text-xs font-semibold bg-white flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                                onClick={() => setOpenDropdown(openDropdown === 'store' ? null : 'store')}
                            >
                                <i className="ti ti-building-store text-primary text-sm" />
                                <span className="text-gray-900 max-w-[120px] truncate">
                                    {selectedBranch?.name || user?.branch?.name || 'Select Branch'}
                                </span>
                                <i className="ti ti-chevron-down text-gray-400 text-xs" />
                            </button>

                            {openDropdown === 'store' && (
                                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
                                    <div className="px-3 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b">
                                        Select Operating Branch
                                    </div>
                                    {branches.map((b) => (
                                        <button
                                            key={b.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedBranch(b);
                                                setOpenDropdown(null);
                                                loadData(b.id);
                                            }}
                                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-primary/5 transition-colors ${
                                                selectedBranch?.id === b.id ? 'font-bold text-primary bg-primary/5' : 'text-gray-700'
                                            }`}
                                        >
                                            <span className="truncate">{b.name}</span>
                                            {selectedBranch?.id === b.id && <i className="ti ti-check text-primary" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </li>

                        {/* Held Orders Pill */}
                        <li className="nav-item">
                            <button
                                type="button"
                                onClick={() => setShowHeldModal(true)}
                                className={`text-xs font-bold py-1.5 px-3 rounded-lg inline-flex items-center gap-1.5 border transition-all cursor-pointer ${
                                    heldOrders.length > 0
                                        ? 'bg-amber-50 text-amber-700 border-amber-300 shadow-sm animate-pulse'
                                        : 'bg-white text-gray-600 border-slate-200 hover:bg-slate-50'
                                }`}
                                title="Held Orders (Parked Sales)"
                            >
                                <i className="ti ti-player-pause" />
                                <span>Held</span>
                                <span className="bg-amber-600 text-white rounded-full px-1.5 py-0.2 text-[10px] font-black">
                                    {heldOrders.length}
                                </span>
                            </button>
                        </li>

                        {/* Calculator Toggle */}
                        <li className="nav-item">
                            <button
                                type="button"
                                onClick={() => setShowCalculator((prev) => !prev)}
                                className={`text-xs font-bold py-1.5 px-3 rounded-lg inline-flex items-center gap-1.5 border transition-all cursor-pointer ${
                                    showCalculator
                                        ? 'bg-primary text-white border-primary shadow-sm'
                                        : 'bg-white text-gray-700 border-slate-200 hover:bg-slate-50'
                                }`}
                                title="POS Calculator (F3)"
                            >
                                <i className="ti ti-calculator text-sm" />
                                <span className="hidden sm:inline">Calculator</span>
                                <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${showCalculator ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    F3
                                </span>
                            </button>
                        </li>

                        {/* Sound Toggle */}
                        <li className="nav-item">
                            <button
                                type="button"
                                onClick={() => setSoundEnabled(!soundEnabled)}
                                className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-gray-600 hover:text-primary transition-all cursor-pointer"
                                title={soundEnabled ? 'Mute POS Audio' : 'Enable POS Audio'}
                            >
                                <i className={soundEnabled ? 'ti ti-volume' : 'ti ti-volume-off text-danger'} />
                            </button>
                        </li>

                        {/* Fullscreen */}
                        <li className="nav-item">
                            <button
                                type="button"
                                onClick={toggleFullscreen}
                                className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-gray-600 hover:text-primary transition-all cursor-pointer"
                                title="Fullscreen"
                            >
                                <i className="ti ti-maximize" />
                            </button>
                        </li>

                        {/* Profile Pill */}
                        <li className="nav-item relative">
                            <button
                                type="button"
                                onClick={() => setOpenDropdown(openDropdown === 'profile' ? null : 'profile')}
                                className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shadow-sm cursor-pointer"
                            >
                                {user?.name?.charAt(0) || 'A'}
                            </button>
                            {openDropdown === 'profile' && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                                    <div className="px-4 py-2 border-b">
                                        <p className="text-xs font-bold text-gray-900 truncate">{user?.name || 'Cashier'}</p>
                                        <p className="text-[10px] text-gray-400 uppercase font-semibold">{user?.role || 'Staff'}</p>
                                    </div>
                                    <Link href="/dashboard/settings/profile" className="block px-4 py-2 text-xs text-gray-700 hover:bg-slate-50">
                                        <i className="ti ti-user-circle me-2" />My Profile
                                    </Link>
                                    <Link href="/dashboard/sales" className="block px-4 py-2 text-xs text-gray-700 hover:bg-slate-50">
                                        <i className="ti ti-receipt me-2" />Sales List
                                    </Link>
                                    <hr className="my-1 border-slate-100" />
                                    <Link href="/login" className="block px-4 py-2 text-xs text-danger hover:bg-red-50">
                                        <i className="ti ti-logout me-2" />Sign Out
                                    </Link>
                                </div>
                            )}
                        </li>
                    </ul>
                </div>
            </div>

            {/* Page Content POS */}
            <div className="page-wrapper pos-pg-wrapper ms-0 p-3">
                <div className="content pos-design p-0">
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
                        {/* LEFT: Products Catalog Column (8 cols) */}
                        <div className="xl:col-span-8 flex flex-col gap-3">
                            {/* Categories Horizontal Bar */}
                            <div className="bg-white rounded-xl border border-slate-200/80 p-2.5 shadow-sm overflow-x-auto">
                                <ul className="flex items-center gap-2 min-w-max">
                                    <li
                                        onClick={() => setSelectedCategory('all')}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                            selectedCategory === 'all'
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                                        }`}
                                    >
                                        <i className="ti ti-layout-grid text-sm" />
                                        <span>All Products ({catalog.length})</span>
                                    </li>
                                    {categories.map((c) => (
                                        <li
                                            key={c.id}
                                            onClick={() => setSelectedCategory(String(c.id))}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                                String(selectedCategory) === String(c.id)
                                                    ? 'bg-primary text-white shadow-sm'
                                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60'
                                            }`}
                                        >
                                            <i className="ti ti-box text-sm text-slate-400" />
                                            <span>{c.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Search & Barcode Scan Bar */}
                            <div className="bg-white rounded-xl border border-slate-200/80 p-3 shadow-sm flex items-center justify-between flex-wrap gap-3">
                                <div className="flex-1 min-w-[280px] relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                        <i className="ti ti-scan text-base text-primary" />
                                    </span>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        className="w-full pl-9 pr-24 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        placeholder="Scan barcode / SKU / product name (Press Enter)..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={handleBarcodeSearch}
                                        autoFocus
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                                        {searchTerm && (
                                            <button
                                                type="button"
                                                onClick={() => setSearchTerm('')}
                                                className="text-gray-400 hover:text-gray-600 text-xs px-1"
                                            >
                                                <i className="ti ti-x" />
                                            </button>
                                        )}
                                        <span className="text-[10px] font-bold text-gray-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
                                            Press /
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 font-semibold hidden sm:inline">
                                        Showing: <b className="text-gray-900">{filteredCatalog.length}</b> items
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => loadData(selectedBranch?.id)}
                                        className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-gray-600 transition-all cursor-pointer"
                                        title="Refresh Catalog"
                                    >
                                        <i className="ti ti-reload text-xs" />
                                    </button>
                                </div>
                            </div>

                            {/* Products Grid */}
                            <div className="flex-1 bg-white rounded-xl border border-slate-200/80 p-3 shadow-sm min-h-[500px]">
                                {loading ? (
                                    <div className="h-96 flex flex-col items-center justify-center text-gray-400 gap-2">
                                        <i className="ti ti-loader-2 text-3xl animate-spin text-primary" />
                                        <p className="text-xs font-semibold">Loading real-time catalog & stocks...</p>
                                    </div>
                                ) : filteredCatalog.length === 0 ? (
                                    <div className="h-96 flex flex-col items-center justify-center text-gray-400 gap-2">
                                        <i className="ti ti-box-off text-5xl text-gray-300" />
                                        <p className="text-sm font-bold text-gray-700">No products found</p>
                                        <p className="text-xs text-gray-400">Try searching with a different barcode, SKU or name.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
                                        {filteredCatalog.map((product) => {
                                            const price = Number(product.retail_price || product.selling_price || 0);
                                            const hasVariants = product.variants && product.variants.length > 0;
                                            const isUntracked = product.track_stock === false || product.allow_negative_stock === true;
                                            const stockQty = Number(product.sellable_quantity ?? product.stock?.quantity ?? 0);
                                            const totalVariantStock = hasVariants
                                                ? product.variants.reduce((sum, v) => sum + Number(v.sellable_quantity ?? v.stock?.quantity ?? 0), 0)
                                                : 0;
                                            const isOutOfStock = !isUntracked && (hasVariants ? totalVariantStock <= 0 : stockQty <= 0);
                                            const cartCount = cart
                                                .filter((i) => i.product_id === product.id)
                                                .reduce((sum, i) => sum + i.quantity, 0);

                                            let priceDisplay = `৳${price.toFixed(2)}`;
                                            if (hasVariants && product.variants.length > 0) {
                                                const vPrices = product.variants.map((v) => Number(v.selling_price || v.retail_price || price));
                                                const minP = Math.min(...vPrices);
                                                const maxP = Math.max(...vPrices);
                                                priceDisplay = minP === maxP ? `৳${minP.toFixed(2)}` : `৳${minP.toFixed(0)} - ৳${maxP.toFixed(0)}`;
                                            }

                                            return (
                                                <div
                                                    key={product.id}
                                                    onClick={() => !isOutOfStock && addToCart(product)}
                                                    className={`group relative rounded-xl border p-2.5 flex flex-col justify-between transition-all select-none ${
                                                        isOutOfStock
                                                            ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                                                            : cartCount > 0
                                                            ? 'border-primary bg-primary/2 shadow-md ring-2 ring-primary/20 cursor-pointer'
                                                            : 'border-slate-200 bg-white hover:border-primary hover:shadow-md cursor-pointer'
                                                    }`}
                                                >
                                                    {/* Stock Badge */}
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        {hasVariants ? (
                                                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                                                ✨ {product.variants.length} Variants ({isUntracked ? 'In Stock' : totalVariantStock > 0 ? `${totalVariantStock} left` : 'Out'})
                                                            </span>
                                                        ) : isUntracked ? (
                                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                                                In Stock
                                                            </span>
                                                        ) : stockQty > 5 ? (
                                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                                Stock: {stockQty}
                                                            </span>
                                                        ) : stockQty > 0 ? (
                                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                                                Low: {stockQty}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                                                                Out of Stock
                                                            </span>
                                                        )}

                                                        {cartCount > 0 && (
                                                            <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shadow-sm">
                                                                {cartCount}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Product Image */}
                                                    <div className="h-24 w-full bg-slate-50 rounded-lg flex items-center justify-center p-2 mb-2 group-hover:scale-102 transition-transform">
                                                        <img
                                                            src={product.image_path || '/assets/img/products/pos-product-01.png'}
                                                            alt={product.name}
                                                            className="max-h-full max-w-full object-contain"
                                                            onError={(e) => {
                                                                e.target.src = '/assets/img/products/pos-product-01.png';
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Info */}
                                                    <div>
                                                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block truncate">
                                                            {product.category?.name || 'General'}
                                                        </span>
                                                        <h6 className="text-xs font-bold text-gray-900 truncate mb-1" title={product.name}>
                                                            {product.name}
                                                        </h6>
                                                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                                            <span className="text-xs font-black text-slate-900">
                                                                {priceDisplay}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                disabled={isOutOfStock}
                                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 transition-all ${
                                                                    isOutOfStock
                                                                        ? 'bg-slate-200 text-slate-400'
                                                                        : hasVariants
                                                                        ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-2xs'
                                                                        : 'bg-primary text-white group-hover:bg-primary-hover shadow-2xs'
                                                                }`}
                                                            >
                                                                {hasVariants ? 'Options' : '+ Add'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Order Summary & Checkout Column (4 cols) */}
                        <div className="xl:col-span-4 flex flex-col gap-3">
                            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex flex-col justify-between flex-1">
                                <div>
                                    {/* Order Head */}
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-black text-gray-900">Current Order</h3>
                                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-900 text-white">
                                                #{orderNumber}
                                            </span>
                                        </div>
                                        {cart.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={clearCart}
                                                className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                                                title="Clear current cart"
                                            >
                                                <i className="ti ti-trash" /> Clear
                                            </button>
                                        )}
                                    </div>

                                    {/* Customer Selection */}
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                                Customer
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setShowNewCustomerModal(true)}
                                                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                                            >
                                                <i className="ti ti-plus" /> New (F2)
                                            </button>
                                        </div>
                                        <select
                                            className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-gray-800 focus:bg-white focus:border-primary outline-none"
                                            value={customerId}
                                            onChange={(e) => setCustomerId(e.target.value)}
                                        >
                                            <option value="">Walk-in Customer (নগদ ক্রেতা)</option>
                                            {customers.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name} {c.phone ? `(${c.phone})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Cart Line Items */}
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider pb-1.5 border-b border-slate-100">
                                            <span>Item</span>
                                            <span className="text-center w-20">Qty</span>
                                            <span className="text-right">Price</span>
                                        </div>

                                        <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
                                            {cart.length === 0 ? (
                                                <div className="py-8 text-center text-gray-400">
                                                    <i className="ti ti-shopping-cart text-3xl mb-1 text-slate-300" />
                                                    <p className="text-xs font-semibold">Your cart is empty.</p>
                                                    <p className="text-[11px] text-gray-400">Scan barcode or click items to add.</p>
                                                </div>
                                            ) : (
                                                cart.map((item) => (
                                                    <div key={item.key} className="py-2 flex items-center justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFromCart(item.key)}
                                                                    className="text-gray-300 hover:text-red-500 cursor-pointer"
                                                                >
                                                                    <i className="ti ti-trash-x text-sm" />
                                                                </button>
                                                                <p className="text-xs font-bold text-gray-800 truncate" title={item.name}>
                                                                    {item.name}
                                                                </p>
                                                            </div>
                                                            {item.variant_name && (
                                                                <div className="flex items-center gap-1 ml-5 mt-0.5">
                                                                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded inline-flex items-center gap-1">
                                                                        <i className="ti ti-layers-subtract text-[10px]" />
                                                                        {item.variant_name}
                                                                    </span>
                                                                    {item.sku && (
                                                                        <span className="text-[9px] text-gray-400 font-mono">
                                                                            ({item.sku})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                            <p className="text-[11px] text-gray-400 ml-5">৳{item.price.toFixed(2)} each</p>
                                                        </div>

                                                        {/* Quantity Stepper */}
                                                        <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(item.key, -1)}
                                                                className="w-5 h-5 rounded flex items-center justify-center bg-white hover:bg-slate-200 text-xs font-bold shadow-2xs cursor-pointer"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="w-6 text-center text-xs font-black text-gray-900">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(item.key, 1)}
                                                                className="w-5 h-5 rounded flex items-center justify-center bg-white hover:bg-slate-200 text-xs font-bold shadow-2xs cursor-pointer"
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                        {/* Total Line Price */}
                                                        <div className="text-right w-20">
                                                            <span className="text-xs font-black text-gray-900">
                                                                ৳{(item.price * item.quantity).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Order Calculations */}
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-2 text-xs">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal:</span>
                                            <span className="font-bold text-gray-900">৳{subtotal.toFixed(2)}</span>
                                        </div>

                                        {/* Discount Row */}
                                        <div className="bg-white rounded-lg p-2.5 border border-slate-200/90 space-y-1.5">
                                            <div className="flex justify-between items-center text-gray-700">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold">Discount:</span>
                                                    {/* Segmented Switcher */}
                                                    <div className="inline-flex rounded-md border border-slate-200 bg-slate-100 p-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setDiscountType('percent')}
                                                            className={`px-2 py-0.5 text-[10px] font-black rounded transition-all cursor-pointer ${
                                                                discountType === 'percent'
                                                                    ? 'bg-red-500 text-white shadow-2xs'
                                                                    : 'text-slate-600 hover:text-slate-900'
                                                            }`}
                                                        >
                                                            % Percent
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDiscountType('fixed')}
                                                            className={`px-2 py-0.5 text-[10px] font-black rounded transition-all cursor-pointer ${
                                                                discountType === 'fixed'
                                                                    ? 'bg-red-500 text-white shadow-2xs'
                                                                    : 'text-slate-600 hover:text-slate-900'
                                                            }`}
                                                        >
                                                            ৳ Fixed
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={discountType === 'percent' ? 100 : undefined}
                                                            value={discount}
                                                            onChange={(e) => setDiscount(e.target.value)}
                                                            className="w-20 text-right py-1 pl-1.5 pr-5 border border-slate-200 bg-slate-50 rounded text-xs font-black text-red-600 outline-none focus:bg-white focus:border-red-400"
                                                            placeholder="0"
                                                        />
                                                        <span className="absolute right-1.5 top-1 text-[11px] font-bold text-gray-400 pointer-events-none">
                                                            {discountType === 'percent' ? '%' : '৳'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quick Discount Presets & Live Deduction */}
                                            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                                <div className="flex items-center gap-1">
                                                    {discountType === 'percent'
                                                        ? [5, 10, 15, 20].map((pct) => (
                                                              <button
                                                                  key={pct}
                                                                  type="button"
                                                                  onClick={() => setDiscount(pct)}
                                                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                                                                      Number(discount) === pct
                                                                          ? 'bg-red-50 text-red-700 border-red-300 font-black'
                                                                          : 'bg-white text-gray-500 border-slate-200 hover:bg-slate-50'
                                                                  }`}
                                                              >
                                                                  {pct}%
                                                              </button>
                                                          ))
                                                        : [50, 100, 200, 500].map((amt) => (
                                                              <button
                                                                  key={amt}
                                                                  type="button"
                                                                  onClick={() => setDiscount(amt)}
                                                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                                                                      Number(discount) === amt
                                                                          ? 'bg-red-50 text-red-700 border-red-300 font-black'
                                                                          : 'bg-white text-gray-500 border-slate-200 hover:bg-slate-50'
                                                                  }`}
                                                              >
                                                                  ৳{amt}
                                                              </button>
                                                          ))}
                                                </div>
                                                <span className="text-[11px] font-black text-red-600">
                                                    -৳{discountAmount.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Tax / VAT Row */}
                                        <div className="bg-white rounded-lg p-2.5 border border-slate-200/90 space-y-1.5">
                                            <div className="flex justify-between items-center text-gray-700">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold">Tax / VAT:</span>
                                                    {/* Segmented Switcher */}
                                                    <div className="inline-flex rounded-md border border-slate-200 bg-slate-100 p-0.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setTaxType('percent')}
                                                            className={`px-2 py-0.5 text-[10px] font-black rounded transition-all cursor-pointer ${
                                                                taxType === 'percent'
                                                                    ? 'bg-blue-600 text-white shadow-2xs'
                                                                    : 'text-slate-600 hover:text-slate-900'
                                                            }`}
                                                        >
                                                            % Percent
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setTaxType('fixed')}
                                                            className={`px-2 py-0.5 text-[10px] font-black rounded transition-all cursor-pointer ${
                                                                taxType === 'fixed'
                                                                    ? 'bg-blue-600 text-white shadow-2xs'
                                                                    : 'text-slate-600 hover:text-slate-900'
                                                            }`}
                                                        >
                                                            ৳ Fixed
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={taxType === 'percent' ? 100 : undefined}
                                                            value={tax}
                                                            onChange={(e) => setTax(e.target.value)}
                                                            className="w-20 text-right py-1 pl-1.5 pr-5 border border-slate-200 bg-slate-50 rounded text-xs font-black text-blue-600 outline-none focus:bg-white focus:border-blue-400"
                                                            placeholder="0"
                                                        />
                                                        <span className="absolute right-1.5 top-1 text-[11px] font-bold text-gray-400 pointer-events-none">
                                                            {taxType === 'percent' ? '%' : '৳'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quick Tax Presets & Live Addition */}
                                            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                                                <div className="flex items-center gap-1">
                                                    {taxType === 'percent'
                                                        ? [0, 5, 7.5, 10, 15].map((pct) => (
                                                              <button
                                                                  key={pct}
                                                                  type="button"
                                                                  onClick={() => setTax(pct)}
                                                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                                                                      Number(tax) === pct
                                                                          ? 'bg-blue-50 text-blue-700 border-blue-300 font-black'
                                                                          : 'bg-white text-gray-500 border-slate-200 hover:bg-slate-50'
                                                                  }`}
                                                              >
                                                                  {pct}%
                                                              </button>
                                                          ))
                                                        : [0, 20, 50, 100].map((amt) => (
                                                              <button
                                                                  key={amt}
                                                                  type="button"
                                                                  onClick={() => setTax(amt)}
                                                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                                                                      Number(tax) === amt
                                                                          ? 'bg-blue-50 text-blue-700 border-blue-300 font-black'
                                                                          : 'bg-white text-gray-500 border-slate-200 hover:bg-slate-50'
                                                                  }`}
                                                              >
                                                                  ৳{amt}
                                                              </button>
                                                          ))}
                                                </div>
                                                <span className="text-[11px] font-black text-blue-600">
                                                    +৳{taxAmount.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Coupon Badge if applied */}
                                        {appliedCoupon && (
                                            <div className="flex justify-between items-center text-emerald-700 font-bold text-[11px] bg-emerald-50 p-1.5 rounded">
                                                <span>Coupon ({appliedCoupon.code}):</span>
                                                <div className="flex items-center gap-1">
                                                    <span>Applied</span>
                                                    <button type="button" onClick={() => setAppliedCoupon(null)} className="text-red-500">
                                                        <i className="ti ti-x" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Grand Total */}
                                        <div className="pt-2 border-t border-dashed border-slate-300 flex justify-between items-center">
                                            <span className="text-xs font-black uppercase text-gray-700">Total Payable:</span>
                                            <span className="text-lg font-black text-primary">৳{grandTotal.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Payment Method Selector */}
                                    <div className="mt-3">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                                Payment Method
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setShowCouponModal(true)}
                                                className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-0.5"
                                            >
                                                <i className="ti ti-ticket" /> Have Coupon?
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-4 gap-1.5">
                                            {[
                                                { key: 'cash', label: 'Cash (নগদ)', icon: 'ti ti-cash' },
                                                { key: 'card', label: 'Card (কার্ড)', icon: 'ti ti-credit-card' },
                                                { key: 'mobile_banking', label: 'bKash/Nagad', icon: 'ti ti-device-mobile' },
                                                { key: 'due', label: 'Due (বাকি)', icon: 'ti ti-clock-pause' },
                                            ].map((m) => (
                                                <button
                                                    key={m.key}
                                                    type="button"
                                                    onClick={() => setPaymentMethod(m.key)}
                                                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                                                        paymentMethod === m.key
                                                            ? 'bg-primary text-white border-primary shadow-sm font-bold'
                                                            : 'bg-white hover:bg-slate-50 border-slate-200 text-gray-700 font-semibold'
                                                    }`}
                                                >
                                                    <i className={`${m.icon} text-base mb-0.5`} />
                                                    <span className="text-[10px] leading-tight">{m.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Cash Tendered & Change Return / Due Display */}
                                    {paymentMethod === 'cash' && (
                                        <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-gray-700">Cash Received (নগদ গ্রহণ):</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCalculator(true)}
                                                        className="text-[10px] text-primary hover:text-primary-hover font-bold inline-flex items-center gap-1 bg-primary/10 hover:bg-primary/20 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                                                        title="Open Calculator (F3)"
                                                    >
                                                        <i className="ti ti-calculator text-xs" />
                                                        <span>Calc</span>
                                                    </button>
                                                </div>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={cashReceived}
                                                    onChange={(e) => setCashReceived(e.target.value)}
                                                    className="w-24 text-right py-1 px-2 border border-slate-200 bg-white rounded-lg text-xs font-black text-primary outline-none focus:border-primary"
                                                    placeholder="0"
                                                />
                                            </div>

                                            {/* Quick Cash Buttons */}
                                            <div className="flex items-center gap-1 overflow-x-auto pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setCashReceived(String(grandTotal))}
                                                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer whitespace-nowrap"
                                                >
                                                    Exact (৳{grandTotal.toFixed(0)})
                                                </button>
                                                {[500, 1000, 2000].map((amt) => (
                                                    <button
                                                        key={amt}
                                                        type="button"
                                                        onClick={() => setCashReceived(String(amt))}
                                                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 cursor-pointer whitespace-nowrap"
                                                    >
                                                        ৳{amt}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Change or Due Banner */}
                                            {changeAmount > 0 ? (
                                                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 text-emerald-700 font-black text-xs">
                                                    <span>Change Return (ফেরত দিন):</span>
                                                    <span className="text-sm">৳{changeAmount.toFixed(2)}</span>
                                                </div>
                                            ) : dueAmount > 0 ? (
                                                <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 text-amber-700 font-black text-xs">
                                                    <span>Due Amount (বাকি থাকবে):</span>
                                                    <span className="text-sm">৳{dueAmount.toFixed(2)}</span>
                                                </div>
                                            ) : null}
                                        </div>
                                    )}
                                </div>

                                {/* Order Action Buttons */}
                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                                    <button
                                        id="btn-hold-order"
                                        type="button"
                                        onClick={handleHoldOrder}
                                        disabled={cart.length === 0}
                                        className="btn bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm transition-all cursor-pointer"
                                        title="Hold Order (F8)"
                                    >
                                        <i className="ti ti-player-pause" />
                                        <span>Hold</span>
                                    </button>

                                    <button
                                        id="btn-place-order"
                                        type="button"
                                        onClick={handleCheckout}
                                        disabled={submitting || cart.length === 0}
                                        className="btn bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-black py-2.5 px-4 rounded-xl text-xs flex-1 flex items-center justify-center gap-1.5 shadow-md shadow-primary/20 transition-all cursor-pointer"
                                    >
                                        {submitting ? (
                                            <>
                                                <i className="ti ti-loader-2 animate-spin text-sm" />
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <i className="ti ti-check text-sm" />
                                                <span>Pay & Place Order (F4)</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* VARIANT SELECTION MODAL */}
            {showVariantModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-start justify-between pb-3 border-b">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center p-1 border border-slate-200 shrink-0">
                                    <img
                                        src={showVariantModal.image_path || '/assets/img/products/pos-product-01.png'}
                                        alt={showVariantModal.name}
                                        className="max-h-full max-w-full object-contain"
                                        onError={(e) => {
                                            e.target.src = '/assets/img/products/pos-product-01.png';
                                        }}
                                    />
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                        {showVariantModal.category?.name || 'Variation Product'}
                                    </span>
                                    <h4 className="font-bold text-sm text-gray-900 leading-tight">{showVariantModal.name}</h4>
                                    <p className="text-xs text-gray-400 mt-0.5">Select a variant to add to current order</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowVariantModal(null)}
                                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-gray-500 cursor-pointer"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>

                        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                            {showVariantModal.variants?.map((v) => {
                                const vPrice = Number(v.selling_price || v.retail_price || showVariantModal.selling_price || 0);
                                const vStock = Number(v.sellable_quantity ?? v.stock?.quantity ?? 0);
                                const isUntracked = showVariantModal.track_stock === false || showVariantModal.allow_negative_stock === true;
                                const vOutOfStock = !isUntracked && vStock <= 0;
                                const inCartItem = cart.find((i) => i.key === `${showVariantModal.id}-${v.id}`);
                                const inCartQty = inCartItem?.quantity || 0;

                                return (
                                    <div key={v.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 px-2 rounded-xl transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-black text-gray-900">{v.name}</p>
                                                {inCartQty > 0 && (
                                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                                                        In Cart: {inCartQty}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Attribute Pills */}
                                            {v.attributes && typeof v.attributes === 'object' && !Array.isArray(v.attributes) && (
                                                <div className="flex flex-wrap items-center gap-1 mt-1">
                                                    {Object.entries(v.attributes).map(([attrK, attrV]) => (
                                                        <span key={attrK} className="text-[10px] font-semibold bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded border border-purple-200">
                                                            {attrK}: <b className="font-bold">{String(attrV)}</b>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                {v.sku && <span className="text-[10px] text-gray-400 font-mono">SKU: {v.sku}</span>}
                                                {v.barcode && (
                                                    <span className="text-[10px] text-gray-500 font-mono bg-slate-100 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                                        <i className="ti ti-barcode text-[11px]" /> {v.barcode}
                                                    </span>
                                                )}
                                                {isUntracked ? (
                                                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">In Stock</span>
                                                ) : vOutOfStock ? (
                                                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded">Out of Stock</span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                                                        Stock: {vStock}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-xs font-black text-gray-900">৳{vPrice.toFixed(2)}</span>
                                            <button
                                                type="button"
                                                disabled={vOutOfStock}
                                                onClick={() => addToCart(showVariantModal, v)}
                                                className={`btn btn-sm text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-all ${
                                                    vOutOfStock
                                                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                        : inCartQty > 0
                                                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-2xs'
                                                        : 'bg-primary hover:bg-primary-hover text-white shadow-2xs'
                                                }`}
                                            >
                                                <i className="ti ti-plus text-xs" />
                                                {inCartQty > 0 ? 'Add More' : 'Add to Cart'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-2 border-t flex justify-between items-center text-xs text-gray-400">
                            <span>{showVariantModal.variants?.length || 0} variations available</span>
                            <button
                                type="button"
                                onClick={() => setShowVariantModal(null)}
                                className="btn btn-sm bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold text-xs py-1.5 px-4 rounded-lg cursor-pointer"
                            >
                                Done / Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HELD ORDERS MODAL */}
            {showHeldModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b">
                            <div className="flex items-center gap-2">
                                <i className="ti ti-player-pause text-amber-500 text-lg" />
                                <h4 className="font-bold text-sm text-gray-900">Held Orders (Parked Sales)</h4>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowHeldModal(false)}
                                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-gray-500 cursor-pointer"
                            >
                                <i className="ti ti-x" />
                            </button>
                        </div>

                        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                            {heldOrders.length === 0 ? (
                                <div className="py-10 text-center text-gray-400">
                                    <i className="ti ti-inbox text-4xl mb-2 text-slate-300" />
                                    <p className="text-xs font-semibold">No held orders right now.</p>
                                </div>
                            ) : (
                                heldOrders.map((h) => (
                                    <div key={h.id} className="py-3 flex items-center justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-xs text-gray-900">#{h.orderNumber}</span>
                                                <span className="text-[10px] text-gray-400 font-semibold">{h.time}</span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 mt-0.5">
                                                {h.cart?.length || 0} items · Total: <b>৳{h.grandTotal?.toFixed(2)}</b>
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleRecallOrder(h)}
                                                className="btn btn-sm bg-primary hover:bg-primary-hover text-white text-xs font-bold py-1 px-3 rounded-lg cursor-pointer"
                                            >
                                                Recall
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteHeld(h.id)}
                                                className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center cursor-pointer"
                                                title="Discard"
                                            >
                                                <i className="ti ti-trash text-xs" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="pt-2 border-t flex justify-end">
                            <button
                                type="button"
                                onClick={() => setShowHeldModal(false)}
                                className="btn btn-sm bg-slate-100 text-gray-700 font-bold text-xs py-1.5 px-4 rounded-lg cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE CUSTOMER MODAL */}
            {showNewCustomerModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleCreateCustomer} className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b">
                            <h4 className="font-bold text-sm text-gray-900">Add New Customer</h4>
                            <button type="button" onClick={() => setShowNewCustomerModal(false)} className="text-gray-400 hover:text-gray-600">
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">Customer Name *</label>
                            <input
                                type="text"
                                className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg outline-none focus:border-primary"
                                required
                                placeholder="e.g. Tanvir Ahmed"
                                value={newCustomer.name}
                                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">Phone Number</label>
                            <input
                                type="text"
                                className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg outline-none focus:border-primary"
                                placeholder="017xxxxxxxx"
                                value={newCustomer.phone}
                                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">Email (Optional)</label>
                            <input
                                type="email"
                                className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg outline-none focus:border-primary"
                                placeholder="customer@mail.com"
                                value={newCustomer.email}
                                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                            />
                        </div>
                        <div className="pt-2 flex justify-end gap-2 border-t">
                            <button
                                type="button"
                                onClick={() => setShowNewCustomerModal(false)}
                                className="btn btn-sm bg-slate-100 text-gray-700 font-bold text-xs py-1.5 px-3 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-sm bg-primary text-white font-bold text-xs py-1.5 px-4 rounded-lg shadow-sm">
                                Save Customer
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* APPLY COUPON MODAL */}
            {showCouponModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <form onSubmit={handleApplyCoupon} className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b">
                            <h4 className="font-bold text-sm text-gray-900">Apply Promo / Coupon</h4>
                            <button type="button" onClick={() => setShowCouponModal(false)} className="text-gray-400 hover:text-gray-600">
                                <i className="ti ti-x" />
                            </button>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-700 block mb-1">Coupon Code</label>
                            <input
                                type="text"
                                className="w-full text-xs py-2 px-3 border border-slate-200 rounded-lg uppercase tracking-wider font-bold outline-none focus:border-primary"
                                required
                                placeholder="e.g. EID2026"
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value)}
                            />
                        </div>
                        <div className="pt-2 flex justify-end gap-2 border-t">
                            <button
                                type="button"
                                onClick={() => setShowCouponModal(false)}
                                className="btn btn-sm bg-slate-100 text-gray-700 font-bold text-xs py-1.5 px-3 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-sm bg-indigo-600 text-white font-bold text-xs py-1.5 px-4 rounded-lg shadow-sm">
                                Apply Code
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* SUCCESS / RECEIPT MODAL */}
            {completedSale && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        {/* Thermal Print Receipt Card */}
                        <div id="pos-receipt-print" className="bg-white p-3 border border-dashed border-slate-300 rounded-xl font-mono text-xs space-y-2">
                            <div className="text-center pb-2 border-b border-dashed border-slate-300">
                                <h2 className="text-base font-black text-slate-900 uppercase tracking-wider">
                                    {appInfo?.company_name || 'DreamsPOS Store'}
                                </h2>
                                <p className="text-[11px] text-gray-500">{completedSale.branchName}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">Hotline: {appInfo?.support_email || 'support@pos.com'}</p>
                                <p className="text-[11px] font-bold text-slate-700 mt-1">Tax Invoice: #{completedSale.invoice_number}</p>
                                <p className="text-[10px] text-gray-400">{completedSale.date}</p>
                            </div>

                            <div className="text-[11px] space-y-0.5 py-1">
                                <p><b>Cashier:</b> {completedSale.cashier}</p>
                                <p><b>Customer:</b> {completedSale.customer} {completedSale.customer_phone !== '—' && `(${completedSale.customer_phone})`}</p>
                            </div>

                            <div className="border-t border-b border-dashed border-slate-300 py-1.5">
                                <div className="flex justify-between font-bold text-[11px] mb-1">
                                    <span>Item</span>
                                    <span>Qty × Rate</span>
                                    <span>Total</span>
                                </div>
                                <div className="space-y-1 divide-y divide-slate-100">
                                    {completedSale.items.map((it, idx) => (
                                        <div key={idx} className="pt-1 flex justify-between text-[11px]">
                                            <div className="truncate max-w-[140px]">
                                                <span>{it.name}</span>
                                                {it.variant_name && <span className="text-[10px] text-gray-500 block">({it.variant_name})</span>}
                                            </div>
                                            <span className="text-gray-500">{it.quantity} × {it.price.toFixed(2)}</span>
                                            <span className="font-bold">৳{(it.quantity * it.price).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1 text-[11px] pt-1">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>৳{completedSale.subtotal.toFixed(2)}</span>
                                </div>
                                {completedSale.discount > 0 && (
                                    <div className="flex justify-between text-red-600">
                                        <span>
                                            Discount {completedSale.discountType === 'percent' ? `(${completedSale.discountRate}%)` : '(Fixed)'}:
                                        </span>
                                        <span>-৳{completedSale.discount.toFixed(2)}</span>
                                    </div>
                                )}
                                {completedSale.tax > 0 && (
                                    <div className="flex justify-between text-blue-600">
                                        <span>
                                            Tax / VAT {completedSale.taxType === 'percent' ? `(${completedSale.taxRate}%)` : '(Fixed)'}:
                                        </span>
                                        <span>+৳{completedSale.tax.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm font-black pt-1 border-t border-dashed border-slate-300">
                                    <span>Total Payable:</span>
                                    <span>৳{completedSale.grandTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-700">
                                    <span>Paid ({completedSale.paymentMethod?.toUpperCase()}):</span>
                                    <span className="font-bold">৳{completedSale.paid_amount.toFixed(2)}</span>
                                </div>
                                {completedSale.change_amount > 0 && (
                                    <div className="flex justify-between text-emerald-700 font-bold">
                                        <span>Change Return:</span>
                                        <span>৳{completedSale.change_amount.toFixed(2)}</span>
                                    </div>
                                )}
                                {completedSale.due_amount > 0 && (
                                    <div className="flex justify-between text-amber-700 font-bold">
                                        <span>Due Balance:</span>
                                        <span>৳{completedSale.due_amount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="text-center pt-2 border-t border-dashed border-slate-300 text-[10px] text-gray-400">
                                <p>Thank you for shopping with us!</p>
                                <p>Please preserve this receipt for returns.</p>
                                <p className="font-mono mt-1 font-bold">*** {completedSale.invoice_number} ***</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-hover text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                            >
                                <i className="ti ti-printer" /> Print 80mm Slip
                            </button>
                            <button
                                type="button"
                                onClick={() => setCompletedSale(null)}
                                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-gray-700 rounded-xl font-bold text-xs cursor-pointer"
                            >
                                Close & New Sale
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* POS SMART CALCULATOR MODAL */}
            {showCalculator && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 text-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3.5 border border-slate-800 animate-in fade-in zoom-in-95 duration-150">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold">
                                    <i className="ti ti-calculator text-lg" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-white flex items-center gap-2">
                                        Smart Calculator
                                        <span className="text-[9px] bg-slate-800 text-emerald-400 font-mono px-1.5 py-0.5 rounded border border-slate-700">
                                            Numpad Active
                                        </span>
                                    </h4>
                                    <p className="text-[10px] text-slate-400">Quick retail arithmetic & cash apply</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCalculator(false)}
                                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                                title="Close (Esc)"
                            >
                                <i className="ti ti-x text-sm" />
                            </button>
                        </div>

                        {/* Digital Screen Display */}
                        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 shadow-inner flex flex-col justify-between h-24">
                            <div className="text-right text-xs font-mono text-slate-400 h-4 truncate">
                                {calcEquation || '\u00A0'}
                            </div>
                            <div className="flex items-baseline justify-between overflow-hidden">
                                <span className="text-xs font-mono text-slate-500 font-bold">৳</span>
                                <div className="text-3xl font-black font-mono tracking-wider text-emerald-400 text-right truncate">
                                    {calcDisplay}
                                </div>
                            </div>
                        </div>

                        {/* Quick Presets & Helpers */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-slate-300">
                            <button
                                type="button"
                                onClick={handleLoadGrandTotal}
                                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-primary border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
                                title="Load current order total"
                            >
                                Total (৳{grandTotal.toFixed(0)})
                            </button>
                            {[100, 500, 1000].map((amt) => (
                                <button
                                    key={amt}
                                    type="button"
                                    onClick={() => handleQuickAdd(amt)}
                                    className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors whitespace-nowrap cursor-pointer"
                                >
                                    +{amt}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={handleCopyCalc}
                                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 ml-auto"
                                title="Copy result to clipboard"
                            >
                                <i className="ti ti-copy" />
                                <span>Copy</span>
                            </button>
                        </div>

                        {/* Keypad Grid (4 columns) */}
                        <div className="grid grid-cols-4 gap-2 text-sm font-black">
                            {/* Row 1 */}
                            <button
                                type="button"
                                onClick={handleCalcClear}
                                className="p-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-800/40 transition-colors cursor-pointer"
                            >
                                AC
                            </button>
                            <button
                                type="button"
                                onClick={handleCalcToggleSign}
                                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                            >
                                ±
                            </button>
                            <button
                                type="button"
                                onClick={handleCalcPercent}
                                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                            >
                                %
                            </button>
                            <button
                                type="button"
                                onClick={() => handleCalcOperator('÷')}
                                className="p-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition-colors cursor-pointer"
                            >
                                ÷
                            </button>

                            {/* Row 2 */}
                            <button
                                type="button"
                                onClick={() => handleCalcDigit('7')}
                                className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer"
                            >
                                7
                            </button>
                            <button
                                type="button"
                                onClick={() => handleCalcDigit('8')}
                                className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer"
                            >
                                8
                            </button>
                            <button
                                type="button"
                                onClick={() => handleCalcDigit('9')}
                                className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer"
                            >
                                9
                            </button>
                            <button
                                type="button"
                                onClick={() => handleCalcOperator('×')}
                                className="p-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition-colors cursor-pointer"
                            >
                                ×
                            </button>

                            {/* Row 3 */}
                            <button
                                type="button"
                                onClick={() => handleCalcDigit('4')}
                                className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer"
                            >
                                4
                            </button>
                            <button
                                type="button"
                                onClick={() => handleCalcDigit('5')}
                                className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer"
                            >
                                5
                            </button>
                            <button
                                type="button"
                                onClick={() => handleCalcDigit('6')}
                                className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer"
                            >
                                6
                            </button>
                            <button
                                type="button"
                                onClick={() => handleCalcOperator('-')}
                                className="p-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition-colors cursor-pointer"
                            >
                                −
                            </button>

                            {/* Row 4 */}
                            <button
                                type="button"
                                onClick={() => handleCalcDigit('1')}
                                className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer"
                            >
                                1
                            </button>
                            <button
                                type="button"
                                onClick={() => handleCalcDigit('2')}
                                className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer"
                            >
                                2
                            </button>
                            <button
                                type="button"
                                onClick={() => handleCalcDigit('3')}
                                className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer"
                            >
                                3
                            </button>
                            <button
                                type="button"
                                onClick={() => handleCalcOperator('+')}
                                className="p-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition-colors cursor-pointer"
                            >
                                +
                            </button>

                            {/* Row 5 */}
                            <button
                                type="button"
                                onClick={() => handleCalcDigit('0')}
                                className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer"
                            >
                                0
                            </button>
                            <button
                                type="button"
                                onClick={handleCalcDecimal}
                                className="p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700 transition-colors cursor-pointer"
                            >
                                .
                            </button>
                            <button
                                type="button"
                                onClick={handleCalcBackspace}
                                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center justify-center"
                                title="Backspace"
                            >
                                <i className="ti ti-backspace text-base" />
                            </button>
                            <button
                                type="button"
                                onClick={handleCalcEquals}
                                className="p-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-black shadow-lg shadow-primary/20 transition-all cursor-pointer text-base"
                            >
                                =
                            </button>
                        </div>

                        {/* Apply to Cash Received Primary Action */}
                        <div className="pt-2 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={handleApplyCalcToCash}
                                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
                            >
                                <i className="ti ti-cash text-base" />
                                <span>নগদ প্রদানে বসান (Apply ৳{calcDisplay} to Cash)</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
