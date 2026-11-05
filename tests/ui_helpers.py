"""Use the visible Puppy HQ navigation when a tool has moved off the playfield."""
def find_tool(page, selector):
    matches = page.locator(selector)
    for i in range(matches.count()):
        if matches.nth(i).is_visible():
            return matches.nth(i)
    page.locator('#puppy-hq-launch').click()
    target = page.locator('#puppy-hq-menu').locator(selector).first
    if not target.is_visible() and target.evaluate('(n)=>!!n.closest("details")'):
        page.locator('#puppy-hq-menu .journey-settings summary').click()
    return target

def tap_tool(page, selector):
    find_tool(page, selector).click()

def select_tool(page, selector, value):
    find_tool(page, selector).select_option(value)
    if page.locator('#puppy-hq-menu').evaluate('(n)=>n.open'):
        page.locator('#close-puppy-hq').click()

def equip_puppies(page):
    tap_tool(page, '#edit-arsenal')
    page.locator('#arsenal-slots button').nth(3).click()
    page.locator('#arsenal-choices button').filter(has_text='Puppy squad').click()
    page.locator('#close-loadout').click()
    page.locator('[data-slot="3"]').click()
