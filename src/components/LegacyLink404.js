import React from 'react';
import Layout from '@theme/Layout';
import {useLocation} from '@docusaurus/router';


export default function LegacyLink404() {
    const location = useLocation()
    const legacySource =
        "https://github.com/serenity-bdd/the-serenity-book/tree/master/modules/ROOT/pages/" +
        location.pathname.split("/").reduce((a, b) => b).replace("html", "adoc")
    return (
        <Layout
            title={`404`}
            description="Legacy Links not supported">
            <div style={{
                position: "relative",
                display: "flex",
                width: "100%"
            }}>
                <div style={{
                    margin: "auto",
                    width: "600px",
                    paddingTop: "4rem"
                }}>
                    <h1>404 legacy url</h1>
                    <p>
                        Please use the header links to get to the latest content.
                    </p>
                    <p>
                        If there is anything missing in the new documentation, please let us know or add it yourself.
                    </p>
                    <p>
                        Legacy source might be found at <a
                        href={legacySource}>{legacySource}</a>
                    </p>
                </div>
            </div>
        </Layout>
    );
}
