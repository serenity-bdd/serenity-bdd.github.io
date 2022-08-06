package starter.duckduckgo;

import net.serenitybdd.core.pages.PageComponent;

public class SearchResultSidebar extends PageComponent {
    public String heading() {
        return $(".module__title").getText();
    }
}
