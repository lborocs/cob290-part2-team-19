import Page from "./Page";

const icon = <i className="fa-solid fa-table-columns" />;

export default function Dashboard() {
    return (
        <Page tabName="Dashboard" icon={icon}>
            <h1 className="font-semibold">{icon} Dashboard</h1>
        </Page>
    )
}