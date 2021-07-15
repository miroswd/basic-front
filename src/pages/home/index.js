import { useCallback, useEffect, useState } from "react";
import { DAYS, HASH } from "../../constants";
import api from "../../services/api";
import { Container, Button, Actions } from "./style";

const Home = () => {
  const [hash, setHash] = useState("");

  const email = "teste@teste.com";

  /**
   * @function setCookie
   * @description Salvar o hash como cookie no browser
   * @param name Nome do cookie
   * @param value Valor do cookie
   * @param days Dias para expirar o cookie
   */
  const setCookie = useCallback((name, value, days) => {
    let d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }, []);

  /**
   * @async
   * @function getCookieCV
   * @description Capturar o cookie hash do browser
   * @param cname Nome do Cookie
   * @return {Promise<String>}
   */
  const getCookieCV = useCallback(async (cname) => {
    return new Promise(async (resolve) => {
      let name = cname + "=";
      let decodedCookie = decodeURIComponent(document.cookie);
      let ca = decodedCookie.split(";");
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === " ") {
          c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
          resolve(c.substring(name.length, c.length));
        }
      }
      resolve(0);
    });
  }, []);

  const handleSendEmail = useCallback(async () => {
    try {
      const { data } = await api.post(`/navigation/identify/${hash}`, {
        email,
      });
      if (data.identified) {
        setCookie(HASH, data.userIdentifiedHash, DAYS);
      }
    } catch (err) {
      const { error } = err.response.data;
      if (error === "The hash does not exists") {
        console.log("O hash está quebrado");
      }
    }
  }, [email, hash, setCookie]);

  /**
   * @description cria um hash para o usuário e salva o hash no state hash
   */
  const createHashUser = useCallback(async () => {
    const result = await api.post("/navigation/create-hash");
    if (result) {
      const { data } = result;
      if (data) {
        setCookie(HASH, data.hash, DAYS);
        setHash(data.hash);
      } else {
        console.log(result);
      }
    }
  }, [setCookie]);

  /**
   * @description captura o hash e armazena no state hash
   */
  const showHashUser = useCallback(async () => {
    const userHash = await getCookieCV(HASH);
    if (userHash) {
      setHash(userHash);
    }
    return userHash;
  }, [getCookieCV]);

  /**
   * @description se for o primeiro acesso do usuário, será gerado um hash
   */
  useEffect(() => {
    async function exitsHash() {
      const hasHash = await showHashUser();
      if (!hasHash) createHashUser();
    }
    exitsHash();
  }, [showHashUser, createHashUser]);

  console.log(hash);

  const handleAddCategory = useCallback(async () => {
    try {
      const { data } = await api.post(`/navigation/identify/${hash}`, {
        categories: [
          {
            a1: "categoria 1",
            a2: "categoria 2",
            a3: "categoria 3",
          },
        ],
      });
      console.log(data);
    } catch (err) {
      const { error } = err.response.data;
      if (error === "The hash does not exists") {
        createHashUser();
      }
    }
  }, [hash, createHashUser]);

  const handleAddCategoryIdentified = useCallback(async () => {
    try {
      const { data } = await api.post(`/navigation/identify/${hash}`, {
        email,
        categories: [
          {
            b1: "categoria 1",
            b2: "categoria 2",
            b3: "categoria 3",
          },
        ],
      });
      console.log(data);
    } catch (err) {
      const { error } = err.response.data;
      if (error === "The hash does not exists") {
        createHashUser();
      }
    }
  }, [hash, email, createHashUser]);

  return (
    <Container>
      <Actions>
        <Button onClick={handleSendEmail}>Simular identificação</Button>
        <Button onClick={handleAddCategory}>Adicionar Categoria</Button>
        <Button onClick={handleAddCategoryIdentified}>
          Adicionar Categoria Identificado
        </Button>
      </Actions>
    </Container>
  );
};

export default Home;
