import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('access_token');
    
    // Skip for auth endpoints
    if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
        return next(req);
    }
    
    // Add token to header if available
    if (token) {
        const clonedRequest = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            },
            withCredentials: true
        });
        return next(clonedRequest);
    }
    
    // If no token, still send with credentials for cookie
    const clonedRequest = req.clone({
        withCredentials: true
    });
    
    return next(clonedRequest);
};

// import { HttpInterceptorFn } from '@angular/common/http';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//     const token = localStorage.getItem('access_token');
    
//     if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
//         const clonedRequest = req.clone({
//             setHeaders: {
//                 Authorization: `Bearer ${token}`
//             }
//         });
//         return next(clonedRequest);
//     }
    
//     return next(req);
// };