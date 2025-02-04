import Layout from '../layout/page';

export default function InputPage() {
    return (
        <Layout tabName="Components Index">
            <div className="mb-8">
                <h1 className="text-xl font-bold">Text Inputs <i className="fa-solid fa-i-cursor"></i></h1>
                <ul className="list-disc list-inside">
                    <li>
                        <a  href="/input-components/text" 
                            className="text-blue-600 underline">
                                Short Text Components
                        </a>
                    </li>
                    <li>
                        <a  href="/input-components/textarea" 
                            className="text-blue-600 underline">
                                Text Area/WYSIWYG Editor
                        </a>
                    </li>
                </ul>
            </div>
            <div className="mb-8">
                <h1 className="text-xl font-bold">Filter Inputs <i className="fa-solid fa-filter"></i></h1>
                <ul className="list-disc list-inside">
                    <li>
                        <a  href="/input-components/dropdown" 
                            className="text-blue-600 underline">
                                Dropdowns
                        </a>
                    </li>
                    <li>
                        <a  href="/input-components/date" 
                            className="text-blue-600 underline">
                                Date Select
                        </a>
                    </li>
                </ul>
            </div>
            <div className="mb-8">
                <h1 className="text-xl font-bold">Misc Inputs <i className="fa-solid fa-circle-notch"></i></h1>
                <ul className="list-disc list-inside">
                    <li>
                        <a  href="/input-components/colour" 
                            className="text-blue-600 underline">
                                Colour Select
                        </a>
                    </li>
                    <li>
                        <a  href="/input-components/button" 
                            className="text-blue-600 underline">
                                Buttons
                        </a>
                    </li>
                    <li>
                        <a  href="/input-components/modal" 
                            className="text-blue-600 underline">
                                Modals
                        </a>
                    </li>
                </ul>
            </div>
        </Layout>
    )
}