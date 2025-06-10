//r_layout.ts
useEffect(() => {
    if (Platform.OS === 'web') {
      LoadSkiaWeb({ locateFile: () => '/canvaskit.wasm' })
        .then(() => {
          setLoaded(true);
        })
        .catch((err) => console.error(err));
    } else {
      setLoaded(true);
    }
  }, []);
