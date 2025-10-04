"""
Google NIT Web Scraper using Selenium (Headless Mode)
Extracts NIT information from Google search results
"""

import time
import random
import re
import logging
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import (
    TimeoutException,
    NoSuchElementException,
    WebDriverException
)
from webdriver_manager.chrome import ChromeDriverManager


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraper_log.txt', mode='w'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)


class NITScraper:
    """Web scraper to extract NIT information from Google search results"""

    def __init__(self, company_name):
        """Initialize the scraper with Chrome driver"""
        self.driver = None
        # Construimos la query dinámicamente
        self.search_query = f"nit {company_name}"
        self.output_file = "nit_extraction.txt"

    def setup_driver(self):
        try:
            logger.info("Setting up Chrome driver...")

            chrome_options = Options()
            chrome_options.add_argument('--disable-blink-features=AutomationControlled')
            chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
            chrome_options.add_experimental_option('useAutomationExtension', False)
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--start-maximized')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument(
                'user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                'AppleWebKit/537.36 (KHTML, like Gecko) '
                'Chrome/131.0.0.0 Safari/537.36'
            )

            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            self.driver.implicitly_wait(10)

            logger.info("Chrome driver setup successful")
            return True
        except WebDriverException as e:
            logger.error(f"Failed to initialize Chrome driver: {str(e)}")
            return False

    def perform_search(self):
        try:
            logger.info("Navigating to Google...")
            self.driver.get("https://www.google.com")
            time.sleep(random.uniform(1, 2))

            logger.info(f"Searching for: {self.search_query}")
            search_box = self.driver.find_element(By.NAME, "q")
            for char in self.search_query:
                search_box.send_keys(char)
                time.sleep(random.uniform(0.05, 0.15))
            search_box.send_keys(Keys.RETURN)

            time.sleep(random.uniform(2, 5))
            logger.info("Search completed successfully")
            return True
        except Exception as e:
            logger.error(f"Error during search: {str(e)}")
            return False

    def extract_nit_from_first_result(self):
        try:
            logger.info("Extracting NIT from first search result...")
            wait = WebDriverWait(self.driver, 10)
            wait.until(EC.presence_of_element_located((By.ID, "search")))

            xpath_options = [
                "//div[@id='search']//div[@data-sokoban-container]//div[contains(@class, 'VwiC3b')]",
                "(//div[@id='search']//div[@jscontroller]//span[contains(@class, 'aCOpRe')])[1]",
                "(//div[@id='rso']//div[@data-hveid]//div[contains(@style, '-webkit-line-clamp') or contains(@class, 'VwiC3b')])[1]",
                "(//div[@id='rso']//div[@class='g']//div[@data-sncf='1'])[1]",
            ]

            snippet_text = None
            for xpath in xpath_options:
                try:
                    element = self.driver.find_element(By.XPATH, xpath)
                    snippet_text = element.text
                    if snippet_text:
                        break
                except NoSuchElementException:
                    continue

            if not snippet_text:
                logger.error("Could not find snippet text")
                return None

            nit_pattern = r'NIT\s*[:.]?\s*([\d,\.]+\-\d+)'
            match = re.search(nit_pattern, snippet_text, re.IGNORECASE)

            if match:
                nit_value = match.group(1)
                logger.info(f"Successfully extracted NIT: {nit_value}")
                return nit_value
            else:
                logger.warning("NIT pattern not found")
                return None
        except Exception as e:
            logger.error(f"Error extracting NIT: {str(e)}")
            return None

    def save_to_file(self, nit_value):
        try:
            with open(self.output_file, 'w', encoding='utf-8') as f:
                f.write(nit_value)
            logger.info(f"Saved NIT to {self.output_file}")
            return True
        except Exception as e:
            logger.error(f"Error saving NIT: {str(e)}")
            return False

    def cleanup(self):
        if self.driver:
            try:
                self.driver.quit()
            except Exception:
                pass

    def run(self):
        if not self.setup_driver():
            return False
        if not self.perform_search():
            return False
        nit_value = self.extract_nit_from_first_result()
        if nit_value:
            self.save_to_file(nit_value)
            print(f"\n✓ Extracted NIT: {nit_value}")
            print(f"✓ Saved to {self.output_file}")
            return True
        else:
            print("\n✗ Could not extract NIT")
            return False
        self.cleanup()


def main():
    company = input("Ingrese el nombre de la empresa: ")
    scraper = NITScraper(company)
    scraper.run()


if __name__ == "__main__":
    main()
