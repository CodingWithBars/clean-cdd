import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    marginTop: 50,
    marginBottom: 100,
    marginHorizontal: 20
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderColor: '#444',
    borderWidth: 1,
  },
  label: {
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
    fontSize: 14,
  },
  picker: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#444',
  },
  imagePicker: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageText: {
    color: '#888',
    fontSize: 14,
    padding: 10,
    borderRadius: 8,
    borderColor: '#444',
    borderWidth: 1,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  footer: {
    padding: 20,
    borderTopColor: '#333',
    borderTopWidth: 1,
  },
  submitButton: {
    backgroundColor: '#00c853',
    padding: 15,
    borderRadius: 10,
  },
  submitText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileImage:{
    
  }
});

export default styles;
