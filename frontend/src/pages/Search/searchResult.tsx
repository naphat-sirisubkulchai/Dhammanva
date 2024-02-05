import { SearchResults } from "../../components/search";
import { Flex, Grid, GridItem } from "@chakra-ui/react";
import { Footer, HeaderSearch } from "../../components/layout";
import { SearchResultInterface, DataItem } from "../../models/qa";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Pagination from "@choc-ui/paginator";

/**
 * Render the search result page.
 *
 * @return {JSX.Element} The JSX element representing the search result page.
 */
function SearchResultPage() {
  const navigate = useNavigate();
  const [queryMessage, SetQueryMessage] = useState("");
  const [data, SetData] = useState<DataItem[]>([]);
  const [tokens, SetTokens] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Set the number of items per page here
  const [searchParams] = useSearchParams();
  const query = searchParams.get("search");

  // When query change; get the result from session storage
  useEffect(() => {
    if (query) {
      SetQueryMessage(query);
      setCurrentPage(1);
      const responseData = sessionStorage.getItem("response");
      if (responseData != null) {
        const { data, tokens }: Pick<SearchResultInterface, "data" | "tokens"> =
          JSON.parse(responseData);
        SetData(data);
        SetTokens(tokens);
      }
    }
  }, [query]);

  // ------ Header Search in result page ---------
  const SetSearchParams = (searchParameter: string) => {
    SetQueryMessage(searchParameter);
  };

  const performSearch = (searchParameter: string) => {
    navigate(`?search=${searchParameter}`);
    location.reload();
  };
  // --------------------------------------------

  // ------- Pagination  ----------------------
  const changePage = (current: number | undefined) => {
    if (current) {
      setCurrentPage(current);
    }
  };

  // Calculate the start and end index for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Get the data for the current page
  let currentPageData = data;
  if (data != null) {
    currentPageData = data.slice(startIndex, endIndex);
  }
  // --------------------------------------------

  return (
    <Grid
      templateRows="0.2fr 2fr 0.2fr"
      templateAreas={`" header"
                        " main"
                        " footer"`}
      gap={4}
      w="full"
      h="100svh"
    >
      <GridItem pl="2" area={"header"} >
        {query && (
          <HeaderSearch
            query={query}
            searchParam={queryMessage}
            setSearchParams={SetSearchParams}
            performSearch={performSearch}
          />
        )}
      </GridItem>
      <GridItem pl="2" area={"main"}>
        {data != null && (
          <>
            <SearchResults
              data={currentPageData}
              query={queryMessage}
              tokens={tokens}
            />
            <Flex
              w={{ base: "100%", md: "80%", xl: "70%" }}
              justifyItems={"center"}
            >
              <Pagination
                current={currentPage}
                total={data.length}
                pageSize={itemsPerPage}
                onChange={(current) => changePage(current)}
                paginationProps={{
                  display: "flex",
                }}
                activeStyles={{
                  color: "black",
                  bg: "blackAlpha.200",
                }}
                hoverStyles={{
                  bg: "gray.300",
                }}
              />
            </Flex>
          </>
        )}
      </GridItem>
      <GridItem  area={"footer"} h="8xs" >
        <Footer />
      </GridItem>
    </Grid>
  );
}

export default SearchResultPage;
