import React, { useState } from "react";
import { useEffect } from "react";
import { Movie } from "../interfaces/movie";
import { userMovie } from "../interfaces/userMovie";
import "./UserList.css";
import {
    Box,
    Image,
    Flex,
    Badge,
    Text,
    Menu,
    MenuButton,
    Button,
    MenuList,
    MenuItem
} from "@chakra-ui/core";
import { User } from "../interfaces/user";
import {
    AccordionItem,
    AccordionHeader,
    AccordionPanel,
    AccordionIcon
} from "@chakra-ui/core";
import { AiFillCaretDown, AiFillStar } from "react-icons/ai";
import { FcAlphabeticalSortingAz } from "react-icons/fc";
import { MdMovieFilter } from "react-icons/md";

interface Props {
    user: User;
    movieState: Movie[];
    handleUser: string;
}

const YourList: React.FC<Props> = ({ user, movieState, handleUser }) => {
    const [userMovies, setUserMovies] = useState<userMovie[]>([]);
    const [filteredMovies, setFilteredMovies] = useState<userMovie[]>([]);

    useEffect(() => {
        const storedMovies = localStorage.getItem(`userMovieList-${user.name}`);
        if (storedMovies) {
            setUserMovies(JSON.parse(storedMovies));
        } else {
            setUserMovies(user.userMovieList);
        }
    }, [user]);

    useEffect(() => {
        localStorage.setItem(
            `userMovieList-${user.name}`,
            JSON.stringify(userMovies)
        );
    }, [userMovies, user]);

    //This code needs to filter out deleted movies from the central list
    useEffect(() => {
        const filteredMovies = userMovies.filter((userMovie: userMovie) =>
            movieState.some((movie: Movie) => movie.title === userMovie.title)
        );
        setFilteredMovies(filteredMovies);
        localStorage.setItem(
            `userMovieList-${user.name}`,
            JSON.stringify(filteredMovies)
        );
    }, [userMovies, movieState, "movies"]);

    function handleOnDrop(e: React.DragEvent) {
        const widgetType = JSON.parse(
            e.dataTransfer.getData("widgetType")
        ) as Movie;
        console.log("widgetType", widgetType);
        const newMovie: userMovie = {
            ...widgetType,
            id: userMovies.length
        };
        setUserMovies([...userMovies, newMovie]);
        localStorage.setItem(
            `userMovieList-${user.name}`,
            JSON.stringify([...userMovies, newMovie])
        );
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();
    }

    const handleRatingChange = (movieIndex: number, rating: number) => {
        setUserMovies((prevMovies) => {
            const updatedMovies = [...prevMovies];
            updatedMovies[movieIndex] = {
                ...updatedMovies[movieIndex],
                user_rating: rating
            };
            return updatedMovies;
        });
        localStorage.setItem(
            `userMovieList-${user.name}`,
            JSON.stringify(userMovies)
        );
    };

    function removeMovie(id: number): void {
        setUserMovies(
            [...userMovies].filter((userMovie) => userMovie.id !== id)
        );
        localStorage.setItem(
            `userMovieList-${user.name}`,
            JSON.stringify(
                [...userMovies].filter((userMovie) => userMovie.id !== id)
            )
        );
    }

    const [selected, setSelected] = useState<string>("");

    function handleSortTitle() {
        setSelected("Title");
        const sorted = [...userMovies].sort((a, b) => {
            return a.title > b.title ? 1 : -1;
        });
        setUserMovies(sorted);
        localStorage.setItem(
            `userMovieList-${user.name}`,
            JSON.stringify(userMovies)
        );
    }

    function handleSortMaturity() {
        console.log("called maturity");
        setSelected("Maturity");
        const ratingOrder: { [key: string]: number } = {
            "G ": 1,
            "PG ": 2,
            "PG-13 ": 3,
            "R ": 4
        };
        const sorted = userMovies.sort(
            (a, b) =>
                ratingOrder[a.maturity_rating] - ratingOrder[b.maturity_rating]
        );
        console.log(sorted);
        setUserMovies(sorted);
        localStorage.setItem(
            `userMovieList-${user.name}`,
            JSON.stringify(userMovies)
        );
    }

    function handleSortRating() {
        setSelected("Rating");
        const sorted = [...userMovies].sort((a, b) => {
            return a.user_rating < b.user_rating ? 1 : -1;
        });
        setUserMovies(sorted);
        localStorage.setItem(
            `userMovieList-${user.name}`,
            JSON.stringify(userMovies)
        );
    }

    function handleRemove(movie: userMovie) {
        if (handleUser !== "superList") {
            return (
                <div className="remove-movie">
                    <button onClick={() => removeMovie(movie.id)}>
                        Remove
                    </button>
                </div>
            );
        }
    }

    function handleUserType() {
        if (user.role == "user") {
            return (
                <div>
                    <h2>
                        {" "}
                        {user.name}
                        {"'"}s Movies{" "}
                    </h2>
                    <p>Drag movies here to add them to your list</p>
                    <Menu>
                        <MenuButton as={Button}>
                            {selected == "" ? (
                                <div>
                                    Sort <AiFillCaretDown />
                                </div>
                            ) : (
                                <div>Sorted By: {selected}</div>
                            )}
                        </MenuButton>
                        <MenuList>
                            <MenuItem onClick={handleSortTitle}>
                                Title <FcAlphabeticalSortingAz />
                            </MenuItem>
                            <MenuItem onClick={handleSortMaturity}>
                                Maturity <MdMovieFilter />
                            </MenuItem>
                            <MenuItem onClick={handleSortRating}>
                                Rating <AiFillStar />
                            </MenuItem>
                        </MenuList>
                    </Menu>
                    <div
                        className="userlist"
                        onDrop={handleOnDrop}
                        onDragOver={handleDragOver}
                        data-testid="userdropzone"
                        aria-label="userdropzone"
                        id="userdropzone"
                    >
                        {filteredMovies.map((movie, index) => (
                            <div className="droppedMovie" key={movie.id}>
                                <div className="border">
                                    <AccordionItem>
                                        <AccordionHeader>
                                            <Box
                                                width="100%"
                                                alignContent="left"
                                            >
                                                <Box>
                                                    <Image
                                                        borderRadius="md"
                                                        src={movie.image}
                                                        alt={movie.title}
                                                    />
                                                    <Text
                                                        mt={2}
                                                        fontSize="xl"
                                                        fontWeight="semibold"
                                                    >
                                                        {movie.title}
                                                    </Text>
                                                </Box>

                                                <Box>
                                                    {" "}
                                                    <Text
                                                        ml={2}
                                                        textTransform="uppercase"
                                                        fontSize="sm"
                                                        fontWeight="bold"
                                                        color="pink.800"
                                                    >
                                                        {movie.genre.join(
                                                            " & "
                                                        )}
                                                    </Text>
                                                    <Badge color="red">
                                                        {movie.maturity_rating}
                                                    </Badge>
                                                </Box>
                                                <Box>
                                                    <div className="movie-rating">
                                                        <input
                                                            type="range"
                                                            min="1"
                                                            max="5"
                                                            value={
                                                                movie.user_rating
                                                            }
                                                            onChange={(event) =>
                                                                handleRatingChange(
                                                                    index,
                                                                    parseInt(
                                                                        event
                                                                            .target
                                                                            .value
                                                                    )
                                                                )
                                                            }
                                                        />
                                                        <div>
                                                            {[
                                                                ...Array(
                                                                    movie.user_rating
                                                                )
                                                            ].map(
                                                                (
                                                                    _,
                                                                    starIndex
                                                                ) => (
                                                                    <span
                                                                        key={
                                                                            starIndex
                                                                        }
                                                                        className="star yellow"
                                                                    >
                                                                        ★
                                                                    </span>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                    {handleRemove(movie)}
                                                </Box>
                                                <AccordionIcon />
                                            </Box>
                                        </AccordionHeader>
                                        <AccordionPanel pb={4}>
                                            <Text mt={2}>
                                                {movie.description}
                                            </Text>
                                            <Flex mt={2} align="center">
                                                <Text ml={1} fontSize="sm">
                                                    <b>
                                                        {movie.cast.join(" , ")}
                                                    </b>
                                                </Text>
                                            </Flex>
                                        </AccordionPanel>
                                    </AccordionItem>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        } else {
            return <div className="emptylist"> </div>;
        }
    }
    return <div>{handleUserType()}</div>;
};

export default YourList;
