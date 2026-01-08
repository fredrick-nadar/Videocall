import { use, useEffect } from "react";
import { useNavigate } from "react-router-dom"

const withAuth = (WrappedComponent) => {

    const AuthenticatedComponent = (props) => {
        const router = useNavigate();
        const isAuthenticated = () =>{
            if(localStorage.getItem("token")){
                return true;
            }
            return false;
        }
        useEffect(() => {
            if (!isAuthenticated()) {
                router("/auth");
            }
        }, []);

        return <WrappedComponent {...props} />  ;
    }
    return AuthenticatedComponent;
}

export default withAuth;
