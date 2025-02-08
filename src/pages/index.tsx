import Page from "./components/(Page)";
import Login from "./login"
export default function Root() {
    // TODO : Properly route index to correct dest
    // Check if logged in, if not, route to Login
    // Else, route to dashboard
    return (
    <Page silent={true} tabName="Login">
        <Login/>;
    </Page>
    );
}

