import React from 'react';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useLocation} from '@docusaurus/router';


export default function LegacyLink404() {
    const location = useLocation()
    const {siteConfig} = useDocusaurusContext();
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
                    width: "400px",
                    paddingTop: "4rem"
                }}>
                    <h1>404 legacy url</h1>
                    <p>
                        {location.pathname}{location.hash}
                    </p>
                    <p>
                        currently unsupported, you can find the old docs sources <a href="https://github.com/serenity-bdd/the-serenity-book/tree/master/modules/ROOT/pages">here</a>. if you miss something, let us know or add it yourself to the new documentation
                    </p>
                </div>
            </div>

        </Layout>
    );
}
