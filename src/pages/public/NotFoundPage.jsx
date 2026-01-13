/**
 * NotFoundPage - 404 Error Page (Public)
 * 
 * Purpose: Shown when user tries to access invalid route
 * Features: Custom 404 message, link back to home
 */
const NotFoundPage = () => {
    return (
        <div>
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist</p>
        </div>
    );
};

export default NotFoundPage;
