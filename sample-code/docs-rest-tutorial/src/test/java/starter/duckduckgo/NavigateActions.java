package starter.duckduckgo;

import net.serenitybdd.core.steps.UIInteractions;
import net.serenitybdd.annotations.Step;

public class NavigateActions extends UIInteractions {
    @Step("Navigate to the home page")
    public void toTheDuckDuckGoSearchPage() {
        openUrl("https://duckduckgo.com/");
    }
}
