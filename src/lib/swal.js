// src/lib/swal.js
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Guard and patch Swal.fire so errors and toasts can ALWAYS be closed easily:
// 1. Clicking on ANY toast card immediately dismisses it.
// 2. Toast close button (×) is always enabled, visible, and clickable.
// 3. Modals always allow outside click, escape key, and close button.
// 4. Timer automatically dismisses toasts without getting stuck.
const originalFire = Swal.fire.bind(Swal);
Swal.fire = function (...args) {
    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
        const opts = { ...args[0] };
        const isToast = Boolean(opts.toast || opts.position === 'top-end' || opts.position === 'top-right');

        if (isToast) {
            opts.toast = true;
            opts.position = opts.position || 'top-end';
            opts.showConfirmButton = opts.showConfirmButton ?? false;
            opts.showCloseButton = true;
            opts.timer = opts.timer ?? 4500;
            opts.timerProgressBar = opts.timerProgressBar ?? true;

            const userDidOpen = opts.didOpen;
            opts.didOpen = (toast) => {
                toast.style.cursor = 'pointer';
                toast.title = 'Click to close';
                toast.onclick = (e) => {
                    Swal.close();
                };
                if (userDidOpen) userDidOpen(toast);
            };
        } else {
            // Modal dialog (e.g. login error, confirm dialog)
            opts.showCloseButton = opts.showCloseButton ?? true;
            opts.allowOutsideClick = opts.allowOutsideClick ?? true;
            opts.allowEscapeKey = opts.allowEscapeKey ?? true;
            if (opts.icon === 'error' && !opts.timer) {
                opts.timer = 5000;
                opts.timerProgressBar = true;
            }
        }
        return originalFire(opts);
    }
    return originalFire(...args);
};

// Ensure window.Swal is always available in client environments
if (typeof window !== 'undefined') {
    window.Swal = Swal;
}

/**
 * High-performance, beautifully styled SweetAlert2 helpers matching DreamsPOS theme
 */

export const swalToast = (title, icon = 'success', text = '') => {
    return Swal.fire({
        toast: true,
        position: 'top-end',
        icon,
        title,
        text: text || undefined,
        showConfirmButton: false,
        showCloseButton: true,
        timer: 4500,
        timerProgressBar: true,
    });
};

export const swalSuccess = (title, text = '') => {
    return Swal.fire({
        icon: 'success',
        title,
        text: text || undefined,
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#f47721',
        showCloseButton: true,
        allowOutsideClick: true,
        timer: 5000,
        timerProgressBar: true,
    });
};

export const swalError = (title, text = '') => {
    return Swal.fire({
        icon: 'error',
        title,
        text: text || undefined,
        confirmButtonText: 'ঠিক আছে',
        confirmButtonColor: '#f47721',
        showCloseButton: true,
        allowOutsideClick: true,
        allowEscapeKey: true,
        timer: 5000,
        timerProgressBar: true,
    });
};

export const swalWarning = (title, text = '') => {
    return Swal.fire({
        icon: 'warning',
        title,
        text: text || undefined,
        confirmButtonText: 'বুঝেছি',
        confirmButtonColor: '#f47721',
        showCloseButton: true,
        allowOutsideClick: true,
        timer: 5000,
        timerProgressBar: true,
    });
};

export const swalConfirm = async ({
    title = 'আপনি কি নিশ্চিত?',
    text = 'এই কাজটি সম্পন্ন করতে চাচ্ছেন?',
    confirmText = 'হ্যাঁ, নিশ্চিত',
    cancelText = 'বাতিল',
    icon = 'question',
    isDelete = false,
} = {}) => {
    const result = await Swal.fire({
        icon,
        title,
        text,
        showCancelButton: true,
        showCloseButton: true,
        allowOutsideClick: true,
        allowEscapeKey: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        confirmButtonColor: isDelete ? '#ef4444' : '#f47721',
        cancelButtonColor: '#64748b',
        reverseButtons: true,
    });
    return !!result.isConfirmed;
};

export const swalLoading = (title = 'লোড হচ্ছে...', text = 'অনুগ্রহ করে অপেক্ষা করুন...') => {
    Swal.fire({
        title,
        text,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });
};

export const swalClose = () => {
    Swal.close();
};

export default Swal;
