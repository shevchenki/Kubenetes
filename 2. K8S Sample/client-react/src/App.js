import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import apiCaller from './utils/apiCaller'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing(2),
        textAlign: 'center',
        color: theme.palette.text.secondary,
    },
}))

export default function App() {
    const classes = useStyles()
    const [dogs, setDogs] = useState(0)
    const [cats, setCats] = useState(0)
    const [isChange, setIsChange] = useState(false)
    const url = 'http://localhost:5000/' //change url what you want connect

    const handleDog = async () => {
        let dog = parseInt(dogs) + 1
        let cat = parseInt(cats)
        await apiCaller(url + dog + '&&' + cat, 'PUT', null);
        setIsChange(true)
    }

    const handleCat = async () => {
        let dog = parseInt(dogs)
        let cat = parseInt(cats) + 1
        await apiCaller(url + dog + '&&' + cat, 'PUT', null);
        setIsChange(true)
    }

    const handleReset = async () => {
        await apiCaller(url + '0&&0', 'PUT', null);
        setIsChange(true)
    }

    useEffect(() => {
        async function fetchData() {
            const result = await apiCaller(url, 'GET', null);
            setDogs(result.data.data.Item.dog);
            setCats(result.data.data.Item.cat);
            setIsChange(false)
        }
        fetchData();
    }, [isChange]);

    return (
        <div className={classes.root}>
            <Grid container spacing={2}>
                <Grid item xs={11}>
                    <Paper className={classes.paper} elevation={0}>
                        <Typography variant="h3" component="h3" style={{marginLeft: "80px"}}>
                            WELCOME TO KUBENETES
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={1} >
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            style={{ width: "100%", height: 50, borderRadius: 5, marginTop: 5, marginRight: 5 }}
                            onClick={() => handleReset()}
                        >
                            RESET
                        </Button>
                    </Box>
                </Grid>
                <Grid item xs={2} />
                <Grid item xs={4} >
                    <Paper elevation={0}>
                        <Typography variant="h5" component="h2" align="center">
                            Số người yêu Dog: {dogs}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={4} >
                    <Paper elevation={0}>
                        <Typography variant="h5" component="h2" align="center">
                            Số người yêu Cat: {cats}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={2} />
                <Grid item xs={2} />
                <Grid item xs={4} >
                    <Box
                        display="flex"
                        height={400}
                        alignItems="center"
                        justifyContent="center"
                    >
                        <img src="https://namnd-picture.s3-ap-northeast-1.amazonaws.com/dog.jpg" height="400" alt="dog" />
                    </Box>
                </Grid>
                <Grid item xs={4} >
                    <Box
                        display="flex"
                        height={400}
                        alignItems="center"
                        justifyContent="center"
                        marginLeft={2}
                    >
                        <img src="https://namnd-picture.s3-ap-northeast-1.amazonaws.com/cat.jpg" height="400" alt="dog" />
                    </Box>
                </Grid>
                <Grid item xs={2} />
                <Grid item xs={2} />
                <Grid item xs={4} >
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            style={{ width: "80%", height: 60 }}
                            onClick={() => handleDog()}
                        >
                            DOG
                        </Button>
                    </Box>
                </Grid>

                <Grid item xs={4} >
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Button
                            variant="contained"
                            color="secondary"
                            style={{ width: "80%", height: 60 }}
                            onClick={() => handleCat()}
                        >
                            CAT
                        </Button>
                    </Box>
                </Grid>
                <Grid item xs={2} />
            </Grid>
        </div>
    );
}