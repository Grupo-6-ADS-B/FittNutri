package fitt_nutri.example.demo;

import fitt_nutri.example.demo.util.GoogleTokenVerifierUtil;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest
class DemoApplicationTests {

	@MockBean
	GoogleTokenVerifierUtil googleTokenVerifierUtil;

	@Test
	void contextLoads() {
	}

}
